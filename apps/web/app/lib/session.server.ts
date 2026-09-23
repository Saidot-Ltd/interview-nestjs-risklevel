const COOKIE_NAME = 'interview_user';
export const DEFAULT_USER_EMAIL = 'alice@acme.test';

export function readUserCookie(request: Request): string | null {
    const cookieHeader = request.headers.get('Cookie');
    if (!cookieHeader) {
        return null;
    }

    const match = cookieHeader
        .split(';')
        .map((part) => part.trim())
        .find((part) => part.startsWith(`${COOKIE_NAME}=`));

    if (!match) {
        return null;
    }

    return decodeURIComponent(match.slice(COOKIE_NAME.length + 1));
}

export function buildUserCookie(userEmail: string): string {
    return `${COOKIE_NAME}=${encodeURIComponent(userEmail)}; Path=/; HttpOnly; SameSite=Lax`;
}
