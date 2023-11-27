import { ObjectId } from "mongodb"
import { _id } from "./_id"

export interface Account {
    _id: ObjectId,
    name: string,
    email: string,
    password: string,
    ownedAPIs: string[],
    createdAt: number,
    allowedAPIs: string[]
}