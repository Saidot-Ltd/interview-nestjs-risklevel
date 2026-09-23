import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { History } from 'lucide-react';
import { useState } from 'react';
import { redirect, useRouteLoaderData } from 'react-router';
import { SystemActivityDialog } from '~/components/SystemActivityDialog';
import { Alert } from '~/components/ui/alert';
import { Badge } from '~/components/ui/badge';
import { Button } from '~/components/ui/button';
import { Card } from '~/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '~/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '~/components/ui/table';
import { gqlRequest } from '~/lib/api';
import { gql } from '~/lib/api.server';
import { DEFAULT_USER_EMAIL, readUserCookie } from '~/lib/session.server';
import type { loader as rootLoader } from '~/root';
import type { Route } from './+types/systems';

interface GovernSystem {
    id: number;
    name: string;
    riskLevel: string;
    ownerId: number;
    version: number;
}

interface SetRiskLevelVariables {
    systemId: number;
    riskLevel: string;
    organizationId: number;
    actorId: number;
}

const RISK_LEVELS = ['Low', 'Medium', 'High'];

const SYSTEMS_QUERY = `
    query GovernSystems {
        governSystems {
            items {
                id
                name
                riskLevel
                ownerId
                version
            }
        }
    }
`;

const SET_RISK_LEVEL_MUTATION = `
    mutation SetSystemRiskLevel($systemId: Int!, $riskLevel: String!, $organizationId: Int!, $actorId: Int) {
        setSystemRiskLevel(systemId: $systemId, riskLevel: $riskLevel, organizationId: $organizationId, actorId: $actorId) {
            id
            name
            riskLevel
            version
        }
    }
`;

export async function loader({ request }: Route.LoaderArgs) {
    if (!readUserCookie(request)) {
        throw redirect(`/login?as=${DEFAULT_USER_EMAIL}`);
    }

    const result = await gql<{ governSystems: { items: GovernSystem[] } }>(
        SYSTEMS_QUERY,
        {},
        request.headers.get('Cookie'),
    );

    return { systems: result.data?.governSystems.items ?? [] };
}

export default function Systems({ loaderData }: Route.ComponentProps) {
    const user = useRouteLoaderData<typeof rootLoader>('root')!.user!;
    const queryClient = useQueryClient();

    const { data: systems = [] } = useQuery({
        queryKey: ['systems'],
        queryFn: () =>
            gqlRequest<{ governSystems: { items: GovernSystem[] } }>(SYSTEMS_QUERY, {}).then(
                (result) => result.governSystems.items,
            ),
        initialData: loaderData.systems,
        staleTime: 30_000,
    });

    const mutation = useMutation({
        mutationFn: (variables: SetRiskLevelVariables) =>
            gqlRequest<{ setSystemRiskLevel: GovernSystem }>(SET_RISK_LEVEL_MUTATION, variables),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['systems'] });
            queryClient.invalidateQueries({ queryKey: ['activity'] });
        },
    });

    const [activeSystem, setActiveSystem] = useState<GovernSystem | null>(null);

    const highCount = systems.filter((system) => system.riskLevel === 'High').length;
    const mediumCount = systems.filter((system) => system.riskLevel === 'Medium').length;
    const pendingSystemId = mutation.isPending ? mutation.variables.systemId : undefined;

    return (
        <main>
            <div className="flex flex-wrap items-start justify-between gap-6">
                <div>
                    <h1 className="font-semibold text-2xl text-[var(--fg)]">AI systems</h1>
                    <p className="mt-1 text-[var(--fg3)]">Risk level per governed system in your organisation.</p>
                </div>
                <Card className="flex gap-6 px-4 py-3">
                    <StatTile label="Systems" value={systems.length} />
                    <StatTile label="High" value={highCount} />
                    <StatTile label="Medium" value={mediumCount} />
                </Card>
            </div>
            <div data-tour="error-slot">
                {mutation.isError ? <Alert className="mt-4">{mutation.error.message}</Alert> : null}
            </div>
            <Card className="mt-6">
                {systems.length === 0 ? (
                    <p className="p-6 text-[var(--fg3)]">No systems found.</p>
                ) : (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-full">Name</TableHead>
                                <TableHead className="whitespace-nowrap text-right">Owner id</TableHead>
                                <TableHead className="whitespace-nowrap text-right">Version</TableHead>
                                <TableHead className="whitespace-nowrap">Risk level</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {systems.map((system, index) => (
                                <SystemRow
                                    key={system.id}
                                    system={system}
                                    tourAnchor={index === 0}
                                    isPending={pendingSystemId === system.id}
                                    onChangeRiskLevel={(riskLevel) =>
                                        mutation.mutate({
                                            systemId: system.id,
                                            riskLevel,
                                            organizationId: user.organizationId,
                                            actorId: user.id,
                                        })
                                    }
                                    onOpenActivity={() => setActiveSystem(system)}
                                />
                            ))}
                        </TableBody>
                    </Table>
                )}
                <div className="border-[var(--line)] border-t px-4 py-2 text-[var(--fg3)] text-sm">
                    {systems.length} systems · organisation {user.organizationId} · acting as {user.email}
                </div>
            </Card>
            {/* TODO: pagination */}
            <SystemActivityDialog
                systemId={activeSystem?.id ?? 0}
                systemName={activeSystem?.name ?? ''}
                open={activeSystem !== null}
                onOpenChange={(open) => {
                    if (!open) {
                        setActiveSystem(null);
                    }
                }}
            />
        </main>
    );
}

function StatTile({ label, value }: { label: string; value: number }) {
    return (
        <div className="text-center">
            <div className="font-semibold text-[var(--fg)] text-xl tabular-nums">{value}</div>
            <div className="text-[.72rem] text-[var(--fg3)] uppercase">{label}</div>
        </div>
    );
}

function RiskLevelBadge({ level }: { level: string }) {
    const variant = level === 'Low' ? 'low' : level === 'High' ? 'high' : 'medium';
    return <Badge variant={variant}>{level}</Badge>;
}

function SystemRow({
    system,
    tourAnchor,
    isPending,
    onChangeRiskLevel,
    onOpenActivity,
}: {
    system: GovernSystem;
    tourAnchor: boolean;
    isPending: boolean;
    onChangeRiskLevel: (riskLevel: string) => void;
    onOpenActivity: () => void;
}) {
    const [riskLevel, setRiskLevel] = useState(system.riskLevel);

    function handleValueChange(value: string) {
        setRiskLevel(value);
        onChangeRiskLevel(value);
    }

    return (
        <TableRow>
            <TableCell>{system.name}</TableCell>
            <TableCell className="text-right text-[var(--fg2)] tabular-nums">{system.ownerId}</TableCell>
            <TableCell className="text-right text-[var(--fg2)] tabular-nums">{system.version}</TableCell>
            <TableCell className="whitespace-nowrap">
                <div className="flex items-center gap-2">
                    <RiskLevelBadge level={riskLevel} />
                    <Select value={riskLevel} onValueChange={handleValueChange}>
                        <SelectTrigger className="w-28" data-tour={tourAnchor ? 'risk-select' : undefined}>
                            <SelectValue>{riskLevel}</SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                            {RISK_LEVELS.map((level) => (
                                <SelectItem key={level} value={level}>
                                    {level}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    {isPending ? <span className="text-[var(--fg3)] text-xs">Saving…</span> : null}
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        data-tour={tourAnchor ? 'activity' : undefined}
                        onClick={onOpenActivity}
                    >
                        <History className="size-3.5" />
                        Activity
                    </Button>
                </div>
            </TableCell>
        </TableRow>
    );
}
