import { useQuery } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogTitle } from '~/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '~/components/ui/table';
import { gqlRequest } from '~/lib/api';

interface AuditEntry {
    id: number;
    actorId: number;
    actorEmail: string;
    before: string;
    after: string;
    createdAt: string;
}

interface NotificationEntry {
    id: number;
    recipientId: number;
    message: string;
    createdAt: string;
}

interface SystemActivity {
    auditLog: AuditEntry[];
    notifications: NotificationEntry[];
}

const SYSTEM_ACTIVITY_QUERY = `
    query SystemActivity($systemId: Int!) {
        systemActivity(systemId: $systemId) {
            auditLog {
                id
                actorId
                actorEmail
                before
                after
                createdAt
            }
            notifications {
                id
                recipientId
                message
                createdAt
            }
        }
    }
`;

interface SystemActivityDialogProps {
    systemId: number;
    systemName: string;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function SystemActivityDialog({ systemId, systemName, open, onOpenChange }: SystemActivityDialogProps) {
    const { data } = useQuery({
        queryKey: ['activity', systemId],
        queryFn: () =>
            gqlRequest<{ systemActivity: SystemActivity }>(SYSTEM_ACTIVITY_QUERY, { systemId }).then(
                (result) => result.systemActivity,
            ),
        enabled: open,
    });

    const auditLog = data?.auditLog ?? [];
    const notifications = data?.notifications ?? [];

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogTitle>{systemName} · activity</DialogTitle>
                <div className="mt-4">
                    <h3 className="font-semibold text-[.72rem] text-[var(--fg3)] uppercase">Audit log</h3>
                    {auditLog.length === 0 ? (
                        <p className="mt-2 text-[var(--fg3)] text-sm">No audit rows</p>
                    ) : (
                        <Table className="mt-2">
                            <TableHeader>
                                <TableRow>
                                    <TableHead>When</TableHead>
                                    <TableHead>Who</TableHead>
                                    <TableHead>Change</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {auditLog.map((entry) => (
                                    <TableRow key={entry.id}>
                                        <TableCell className="whitespace-nowrap text-[var(--fg2)] text-sm">
                                            {formatWhen(entry.createdAt)}
                                        </TableCell>
                                        <TableCell className="text-[var(--fg2)] text-sm">{entry.actorEmail}</TableCell>
                                        <TableCell className="text-sm">
                                            {formatChange(entry.before, entry.after)}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </div>
                <div className="mt-6">
                    <h3 className="font-semibold text-[.72rem] text-[var(--fg3)] uppercase">Notifications</h3>
                    {notifications.length === 0 ? (
                        <p className="mt-2 text-[var(--fg3)] text-sm">No notifications</p>
                    ) : (
                        <Table className="mt-2">
                            <TableHeader>
                                <TableRow>
                                    <TableHead>When</TableHead>
                                    <TableHead>Recipient</TableHead>
                                    <TableHead>Message</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {notifications.map((entry) => (
                                    <TableRow key={entry.id}>
                                        <TableCell className="whitespace-nowrap text-[var(--fg2)] text-sm">
                                            {formatWhen(entry.createdAt)}
                                        </TableCell>
                                        <TableCell className="text-[var(--fg2)] text-sm">{entry.recipientId}</TableCell>
                                        <TableCell className="text-sm">{entry.message}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </div>
                <div className="mt-4 border-[var(--line)] border-t pt-2 text-[var(--fg3)] text-xs">
                    {auditLog.length} audit rows · {notifications.length} notifications
                </div>
            </DialogContent>
        </Dialog>
    );
}

function formatWhen(createdAt: string): string {
    const date = new Date(createdAt);
    if (Number.isNaN(date.getTime())) {
        return createdAt;
    }
    return date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

function formatChange(before: string, after: string): string {
    try {
        const beforeValue = JSON.parse(before) as Record<string, unknown>;
        const afterValue = JSON.parse(after) as Record<string, unknown>;
        if ('riskLevel' in afterValue) {
            return `riskLevel: ${beforeValue.riskLevel ?? '?'} → ${afterValue.riskLevel}`;
        }
        return `${before} → ${after}`;
    } catch {
        return `${before} → ${after}`;
    }
}
