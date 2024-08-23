export async function fetchRequest (method: string, target: string, options:{query?: string ,body?: any ,headers?:any}) {
    const{query,body,headers}=options;
    return await fetch(`/api/db/${target}${query ? `?${query}` : ""}`,{
        method:method,
        headers: {
            'Content-Type': 'application/json',
            ...headers,
        },
        ...(method !== 'GET' ? { body: JSON.stringify(body) } : {})
    });
}