import { createHash, randomUUID } from "crypto";
import * as mongoDB from "mongodb";
import { ObjectId } from "mongodb";
import "dotenv/config";

import { API, ExternalFacingFilteredAPI } from "./models/API";
import { Account } from "./models/Account";
import { _id } from "./models/_id";

// import { json } from "body-parser";
import { ExternalFacingFilteredAccount, FilteredAccount } from "./models/FilteredAcount";
import { Session } from "./models/Session";

interface accounts {
    [key: string]: Account
};

interface apis {
    [key: string]: API
};

interface sessions {
    [key: string]: string[]
}

interface Collections {
    users: mongoDB.Collection;
    sessions: mongoDB.Collection;
    apis: mongoDB.Collection;
}

let AccountPath: string = "./tables/Accounts.json";
let APIPath: string = "./tables/APIs.json";
let SessionPath: string = "./tables/Sessions.json";

// const DB_CONN_STRING: string = process.env.MONGO_DB_CONN_URL
// `mongodb+srv://${process.env.MONGO_DB_USERNAME}:${process.env.MONGO_DB_PASSWORD}@${process.env.MONGO_DB_URL}`
const DB_NAME: string ="AccountManager";
const USERS_COLLECTION_NAME: string ="Users";
const SESSIONS_COLLECTION_NAME: string ="Sessions";
const APIS_COLLECTION_NAME: string ="APIs";

export let client: mongoDB.MongoClient;
export let db: mongoDB.Db;
export let collections: Collections;


export const setDB = async() => {
    if(!process.env.MONGO_DB_CONN_URL) {
        return false;
    }
    
    client = new mongoDB.MongoClient(process.env.MONGO_DB_CONN_URL);
    // const client: mongoDB.MongoClient = new mongoDB.MongoClient(process.env.MONGO_DB_CONN_URL);
    await client.connect();


    db = client.db(DB_NAME) as mongoDB.Db;
    collections = {
        users: db.collection(USERS_COLLECTION_NAME),
        sessions: db.collection(SESSIONS_COLLECTION_NAME),
        apis: db.collection(APIS_COLLECTION_NAME),
    };
}

export const AccountHandler = {
    getAccount: async (id: string): Promise<Account | false> => {
        let account  = await collections.users.findOne({_id: new ObjectId(id)});
        if(!account) {
            return false;
        }

        return account as any as Account;
    },

    getAccountByName: async(name: string): Promise<Account | false> => {
        let account = await collections.users.findOne({name: name}) as object as Account;

        if(!account) {
            return false;
        }

        return account as any as Account;
    },

    getFilteredAccount: async(id: string) => {
        let account = await AccountHandler.getAccount(id);
        if(!account) {
            return false;
        }
        let filteredAccount: FilteredAccount = {
            _id: account._id,
            name: account.name,
            email: account.email,
            ownedAPIs: account.ownedAPIs,
            createdAt: account.createdAt,
            allowedAPIs: account.allowedAPIs
        };
        return filteredAccount;
    },

    getExternalFacingFilteredAccount: async(id: string) => {
        let account = await AccountHandler.getAccount(id);
        if(!account) {
            return {} as ExternalFacingFilteredAccount;
        }

        let externalFacingFilteredAccount: ExternalFacingFilteredAccount = {
            _id: account._id,
            name: account.name,
            email: account.email,
            createdAt: account.createdAt
        }
        return externalFacingFilteredAccount;
    },
    
    createAccount: async(account: Account): Promise<boolean> => {
        let existingAccount = await AccountHandler.getAccountByName(account.name);

        if(existingAccount) {
            return false;
        }

        await collections.users.insertOne(account);
        return true;
    },

    nowOwnsAPI: async (userID: string, APIID: string) => {
        let account = await AccountHandler.getAccount(userID);

        if(!account) {
            return false;
        }

        account.ownedAPIs.push(APIID);

        await collections.users.updateOne({_id: new ObjectId(userID)}, {"$set": {"ownedAPIs": account.ownedAPIs}});
    }
}

export const APIHandler = {
    //id is the unhashed id that should come from the url 
    getAPI: async(id: string): Promise<API | false> => {
        let api;
        try {
            api = await collections.apis.findOne({"_id": new ObjectId(id)}) as object as API;
        } catch {
            return false;
        }
        if(!api) {
            return false;
        }

        return api;
    },

    verifyAPIKey: async(id: string, key: string): Promise<boolean> => {

        let hashedAPIKey = createHash("sha256").update(key).update(id).digest("hex");

        let API = await collections.apis.findOne({_id: new ObjectId(id)}) as object as API;

        if(API == null) {
            return false;
        }

        return API.keys.indexOf(hashedAPIKey) != -1;
    },

    createAPI: async(api: API): Promise<boolean> => {        
        await collections.apis.insertOne(api);
        return true;
    },

    createAPIKey: async (id: string): Promise<false | string> => {
        let API = await collections.apis.findOne({_id: new ObjectId(id)}) as object as API;
        
        if(API == null) {
            return false;
        }
        
        let key = createHash("sha256").update(randomUUID()).digest("hex");
        let hashedKey = createHash("sha256").update(key).update(id).digest("hex");

        API.keys.push(hashedKey);

        await collections.apis.updateOne({_id: new ObjectId(id)}, {"$set": {keys: API.keys}});

        return key;
    },

    getExternalFacingFilteredAPI: async(id: string) => {
        let api = await APIHandler.getAPI(id);
        if(!api) {
            return {} as ExternalFacingFilteredAPI;
        }

        let externalFacingFilteredAPI: ExternalFacingFilteredAPI = {
            _id: api._id,
            name: api.name,
            returnAddress: api.returnAddress
        }
        return externalFacingFilteredAPI;
    }
}

export const SessionHandler = {
    createSession: async(userID: ObjectId, sessionID: string, apiid: string) => {
        let hashedUserID = createHash("sha256").update(userID.toString()).digest("hex");
        let hashedSessionID = createHash("sha256").update(sessionID).update(apiid).digest("hex");


        let session: Session = await collections.sessions.findOne({userID: hashedUserID}) as any as Session;

        // console.log(`Session: ${session}`);
        // console.log(session);


        if(session == null) {
            await collections.sessions.insertOne({
                userID: hashedUserID,
                sessions: [hashedSessionID]
            })
        } else {
            let newSessionArray: String[] = session.sessions;
            newSessionArray.push(hashedSessionID);
            await collections.sessions.updateOne({userID: hashedUserID}, {$set: {sessions: newSessionArray}}, {upsert: true});
        }
        // if(!allSessions[hashedUserID]) {
        //     allSessions[hashedUserID] = [];
        // }
        
        // allSessions[hashedUserID].push(hashedSessionID);
    },

    verifySession: async(token: string, apiid: string): Promise<boolean> => {
        
        let userSessions: Session
        let hashedUserID, hashedSessionID;
        
        try {
            let userID = token.split(".")[0];
            let sessionID = token.split(".")[1];
    
            hashedUserID = createHash("sha256").update(userID).digest("hex");
            hashedSessionID = createHash("sha256").update(sessionID).update(apiid).digest("hex");
        } catch {
            return false
        }
        
        userSessions = await collections.sessions.findOne({"userID": hashedUserID}) as object as Session;

        //if user doesnt exist, break
        if(userSessions == null) {
            return false;
        }

        //we hash the session ID in the users account and check it if its in the users sessions
        return userSessions.sessions.indexOf(hashedSessionID) > -1
    },

    removeSession: async(token: string, apiid: string): Promise<boolean> => {
        
        let userID = token.split(".")[0];
        let sessionID = token.split(".")[1];

        let hashedUserID = createHash("sha256").update(userID).digest("hex");
        let hashedSessionID = createHash("sha256").update(sessionID).update(apiid).digest("hex");


        let userSessions: Session = await collections.sessions.findOne({"userID": hashedUserID}) as object as Session;
        

        userSessions.sessions = userSessions.sessions.filter(item => item !== hashedSessionID);


        await collections.sessions.updateOne({"userID": hashedUserID}, {"$set": {"sessions": userSessions.sessions}});



        return true;
    }
}