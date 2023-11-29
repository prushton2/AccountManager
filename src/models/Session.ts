import { ObjectId } from "mongodb"

export interface Session {
    _id: ObjectId,
    userID: string,
    sessions: string[]
}