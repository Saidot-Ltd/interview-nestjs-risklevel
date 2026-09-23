import { redirect } from 'react-router';
import { buildUserCookie } from '~/lib/session.server';
import type { Route } from './+types/login';

export async function loader({ request }: Route.LoaderArgs) {
    const url = new URL(request.url);
    const userEmail = url.searchParams.get('as') ?? 'bob@globex.test';

    return redirect('/', {
        headers: {
            'Set-Cookie': buildUserCookie(userEmail),
        },
    });
}
