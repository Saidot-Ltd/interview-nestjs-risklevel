export interface GraphQLResponse<T> {
    data?: T;
    errors?: Array<{ message: string }>;
}

export function unwrap<T>(response: GraphQLResponse<T>): T {
    if (response.errors && response.errors.length > 0) {
        const firstError = response.errors[0] as any;
        throw new Error(firstError.message as string);
    }
    return response.data as T;
}
