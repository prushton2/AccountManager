export interface Account {
    id: string,
    name: string,
    email: string,
    password: string,
    APIKeys: string[],
    createdAt: number,
    allowedAPIKeys: string[]
}