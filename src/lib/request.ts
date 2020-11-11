export class Req {
    baseUrl = '';

    constructor(opts?: { baseUrl?: string }) {
        if (opts?.baseUrl) this.baseUrl = opts.baseUrl;
    }

    // async makeReqest<T>(method: 'GET' | 'POST' | 'PUT' | 'DELETE', path: string, body?: {}) {
    //     const res = await fetch(path, {
    //         method,
    //         headers: {
    //             'Content-Type': 'application/json'
    //         },
    //         ...(body && { body: JSON.stringify(body) }),
    //     });
    //     const data: T = await res.json()

    //     return data;
    // }

    private getPath(path: string) {
        return this.baseUrl + path;
    }

    async get<T>(path: string) {
        const res = await fetch(this.getPath(path), {
            method: 'GET',
        });
        const data: T = await res.json()

        return data;
    }

    async post<T>(path: string, body: {}) {
        const res = await fetch(this.getPath(path), {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            ...(body && { body: JSON.stringify(body) }),
        });
        const data: T = await res.json()

        return data;
    }

    async put<T>(path: string, body: {}) {
        const res = await fetch(this.getPath(path), {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            ...(body && { body: JSON.stringify(body) }),
        });
        const data: T = await res.json()

        return data;
    }

    async delete<T>(path: string) {
        const res = await fetch(this.getPath(path), {
            method: 'DELETE',
        });
        const data: T = await res.json()

        return data;
    }
}