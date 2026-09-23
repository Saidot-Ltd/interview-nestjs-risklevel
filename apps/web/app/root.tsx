import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';
import { isRouteErrorResponse, Links, Meta, Outlet, Scripts, ScrollRestoration } from 'react-router';
import { Tour } from '~/components/Tour';
import { Badge } from '~/components/ui/badge';
import { Button } from '~/components/ui/button';
import { gql } from '~/lib/api.server';
import type { Route } from './+types/root';
import './app.css';

export function Layout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en">
            <head>
                <meta charSet="utf-8" />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <title>Governance</title>
                <Meta />
                <Links />
            </head>
            <body className="bg-[var(--bg)] text-[var(--fg)]">
                {children}
                <ScrollRestoration />
                <Scripts />
            </body>
        </html>
    );
}

export interface CurrentUser {
    id: number;
    email: string;
    organizationId: number;
}

const ME_QUERY = `
    query Me {
        me {
            id
            email
            organizationId
        }
    }
`;

export async function loader({ request }: Route.LoaderArgs) {
    const result = await gql<{ me: CurrentUser }>(ME_QUERY, {}, request.headers.get('Cookie'));
    return { user: result.data?.me ?? null };
}

export default function App({ loaderData }: Route.ComponentProps) {
    const userEmail = loaderData.user?.email ?? '';
    const otherEmail = userEmail === 'alice@acme.test' ? 'bob@globex.test' : 'alice@acme.test';
    const [queryClient] = useState(() => new QueryClient());
    const [tourOpen, setTourOpen] = useState(false);

    return (
        <QueryClientProvider client={queryClient}>
            <header className="h-14 border-[var(--line)] border-b bg-[var(--bg2)]">
                <div className="mx-auto flex h-14 max-w-[1440px] items-center justify-between px-8">
                    <span className="shrink-0 font-semibold text-[var(--fg)]">Governance</span>
                    <div className="flex min-w-0 items-center gap-2" data-tour="user">
                        <Badge className="truncate">{userEmail}</Badge>
                        <Button variant="ghost" size="sm" asChild>
                            <a href={`/login?as=${otherEmail}`}>Switch user</a>
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => setTourOpen(true)}>
                            Tour
                        </Button>
                    </div>
                </div>
            </header>
            <div className="mx-auto max-w-[1440px] px-8 py-6">
                <Outlet />
            </div>
            <Tour open={tourOpen} onOpenChange={setTourOpen} />
        </QueryClientProvider>
    );
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
    let message = 'Something went wrong';
    let details = 'An unexpected error occurred';

    if (isRouteErrorResponse(error)) {
        message = error.status === 404 ? 'Not found' : 'Error';
        details = error.statusText || details;
    } else if (error instanceof Error) {
        details = error.message;
    }

    return (
        <div className="mx-auto max-w-[1440px] px-8 py-6">
            <div className="rounded-lg border-[var(--red-line)] border-l-[3px] bg-[var(--red-bg)] p-4">
                <h1 className="font-semibold text-[var(--red)]">{message}</h1>
                <p className="mt-1 text-[var(--red)]">{details}</p>
            </div>
        </div>
    );
}
