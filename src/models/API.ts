import { ObjectId } from "mongodb";

export interface API {
    id: ObjectId,
    name: string,
    keys: string[],
    returnAddress: string
}