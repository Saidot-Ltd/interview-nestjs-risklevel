import { GraphQLResponse } from '~/lib/graphql';

const API_URL = `${process.env.VITE_APP_API_URL ?? 'http://localhost:4300'}/graphql`;

export async function gql<T>(
    query: string,
    variables: Record<string, unknown>,
    cookie: string | null,
): Promise<GraphQLResponse<T>> {
    const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            ...(cookie ? { Cookie: cookie } : {}),
        },
        body: JSON.stringify({ query, variables }),
    });

    return response.json() as Promise<GraphQLResponse<T>>;
}
