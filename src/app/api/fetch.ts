export async function fetchApi<R>(
    url: string,
    method: string,
    body?: Record<string, any> | string[],
    headers?: Record<string, string>
): Promise<R> {
    const res = await fetch(
        url,
        {
            method,
            body: body ? JSON.stringify(body) : null,
            headers: {
                'Content-Type': 'application/json',
                ...headers,
            },
        }
    );
    try {
        const data = await res.json();
        if (data.status === 'OK' || data.code === 200) {
            return data;
        }
        const errorMessage = data?.message || data?.msg || 'Unknown error';
        throw new Error(errorMessage);
    }
    catch (e) {
        throw e;
    }
}
