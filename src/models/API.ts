import { ObjectId } from "mongodb";

export interface API {
    _id: ObjectId,
    name: string,
    keys: string[],
    returnAddress: string
}

export interface ExternalFacingFilteredAPI {
    _id: ObjectId,
    name: string,
    returnAddress: string
}