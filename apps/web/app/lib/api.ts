import axios from 'axios';
import { GraphQLResponse, unwrap } from '~/lib/graphql';

export const api = axios.create({
    baseURL: import.meta.env.VITE_APP_API_URL ?? 'http://localhost:4300',
    withCredentials: true,
});

export async function gqlRequest<T>(query: string, variables: object): Promise<T> {
    const response = await api.post<GraphQLResponse<T>>('/graphql', { query, variables });
    return unwrap(response.data);
}
