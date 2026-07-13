const BACKEND_API_URL = process.env.BACKEND_API_URL ?? 'http://localhost:5050';

export async function backendFetch(path: string, init?: RequestInit): Promise<Response> {
    return fetch(`${BACKEND_API_URL}${path}`, {
        ...init,
        headers: {
            'Content-Type': 'application/json',
            ...init?.headers,
        },
    });
}
