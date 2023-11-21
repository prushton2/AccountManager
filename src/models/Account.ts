import { _id } from "./_id"

export interface Account {
    _id: _id,
    name: string,
    email: string,
    password: string,
    ownedAPIs: string[],
    createdAt: number,
    allowedAPIs: string[]
}