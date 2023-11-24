import { createHash } from "crypto";
import * as mongoDB from "mongodb";
import { ObjectId } from "mongodb";
import "dotenv/config";

import { API } from "./models/API";
import { Account } from "./models/Account";
import { _id } from "./models/_id";

// import { json } from "body-parser";

import * as fs from "fs";
import { ExternalFacingFilteredAccount, FilteredAccount } from "./models/FilteredAcount";

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
}

let AccountPath: string = "./tables/Accounts.json";
let APIPath: string = "./tables/APIs.json";
let SessionPath: string = "./tables/Sessions.json";

// const DB_CONN_STRING: string = process.env.MONGO_DB_CONN_URL
// `mongodb+srv://${process.env.MONGO_DB_USERNAME}:${process.env.MONGO_DB_PASSWORD}@${process.env.MONGO_DB_URL}`
const DB_NAME: string ="AccountManager"
const USERS_COLLECTION_NAME: string ="Users"

export let client: mongoDB.MongoClient;
export let db: mongoDB.Db;
export let collections: Collections;
// let usersCollection: mongoDB.Collection;


// export const database = {
//     //these functions return the client, db, and collections for the user to store in the variables defined above.
//     getClient: (): mongoDB.MongoClient | null => {
//         if(!process.env.MONGO_DB_CONN_URL) {
//             // return false;
//             return null;
//         }
        
//         return new mongoDB.MongoClient(process.env.MONGO_DB_CONN_URL, { useNewUrlParser: true } as mongoDB.MongoClientOptions);        
//     },

//     getDB: (client: mongoDB.MongoClient): mongoDB.Db => {
//         return client.db(DB_NAME);
//     },

//     getCollections: (db: mongoDB.Db): Collections => {
//         return {
//             users: db.collection(USERS_COLLECTION_NAME)
//         }
//     }

// }

export const setDB = async() => {
    if(!process.env.MONGO_DB_CONN_URL) {
        return false;
    }
    
    console.log(process.env.MONGO_DB_CONN_URL);
    client = new mongoDB.MongoClient(process.env.MONGO_DB_CONN_URL, { useNewUrlParser: true } as mongoDB.MongoClientOptions);
    // const client: mongoDB.MongoClient = new mongoDB.MongoClient(process.env.MONGO_DB_CONN_URL);
    await client.connect();


    db = client.db(DB_NAME) as mongoDB.Db;
    collections = {
        users: db.collection(USERS_COLLECTION_NAME)
    };
}

export const AccountHandler = {
    getAccount: async (id: string) => {
        // let accountData: {} = JSON.parse(fs.readFileSync(AccountPath, {encoding: "utf-8"}));
        // let Account: Account = accountData[id as keyof typeof accountData] as Account;
        // Account["id"] = id;

        console.log(collections.users);

        let account  = await collections.users.findOne({_id: new ObjectId(id)});
        if(!account) {
            return {} as Account;
        }
        
        console.log(account);
        
        return {} as Account;
        // return account as Account;
    },

    getFilteredAccount: async(id: string) => {
        let account = await AccountHandler.getAccount(id);
        if(!account) {
            return false;
        }
        let filteredAccount: FilteredAccount = {
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
        let externalFacingFilteredAccount: ExternalFacingFilteredAccount = {
            name: account.name,
            email: account.email,
            createdAt: account.createdAt
        }
        return externalFacingFilteredAccount;
    },
    
    createAccount: (account: Account) => {
        let accountData: accounts = JSON.parse(fs.readFileSync(AccountPath, {encoding: "utf-8"}));
        // let newAccountData: {} = {...accountData, }
        // accountData[account.id] = account;
        fs.writeFileSync(AccountPath, JSON.stringify(accountData), {encoding: "utf-8"});
    },

    getAccountByName: (name: string) => {
        let accountData: accounts = JSON.parse(fs.readFileSync(AccountPath, {encoding: "utf-8"}));
        // let account: Account = {} as Account;
        for(let k in accountData) {
            if(accountData[k].name == name) {
                return accountData[k];
            }
        }
        // console.log(accountData.keys);

        // return   account;
    },

    authorizeAPI: (userID: string, APIID: string) => {
        let accountData: accounts = JSON.parse(fs.readFileSync(AccountPath, {encoding: "utf-8"}));
        
        if(accountData[userID].allowedAPIs.indexOf(APIID) != -1) {
            return;
        }
        accountData[userID].allowedAPIs.push(APIID);
        fs.writeFileSync(AccountPath, JSON.stringify(accountData), {encoding: "utf-8"});
    }
}

export const APIHandler = {
    //id is the unhashed id that should come from the url 
    getAPI: (id: string) => {
        let APIData: apis = JSON.parse(fs.readFileSync(APIPath, {encoding: "utf-8"}));
        let Api: API = APIData[id];
        
        console.log(Api);
        
        Api.id = id;

        return Api
    },

    createAPI: (api: API) => {
        let APIData: apis = JSON.parse(fs.readFileSync(APIPath, {encoding: "utf-8"}));
        
        if(APIData[api.id] != null) {
            return false;
        }
        
        APIData[api.id] = api;
        fs.writeFileSync(APIPath, JSON.stringify(APIData), {encoding: "utf-8"});
        return true;
    }
}

export const SessionHandler = {
    createSession: (userID: _id, sessionID: string, apiid: string) => {
        let hashedUserID = createHash("sha256").update(userID.$oid).digest("hex");
        let hashedSessionID = createHash("sha256").update(sessionID).update(apiid).digest("hex");

        let allSessions: sessions = JSON.parse(fs.readFileSync(SessionPath, {encoding: "utf-8"}));
        
        if(!allSessions[hashedUserID]) {
            allSessions[hashedUserID] = [];
        }
        
        allSessions[hashedUserID].push(hashedSessionID);
        fs.writeFileSync(SessionPath, JSON.stringify(allSessions), {encoding: "utf-8"});
    },

    verifySession: (token: string, apiid: string) => {
        let userID = token.split(".")[0];
        let sessionID = token.split(".")[1];

        let hashedUserID = createHash("sha256").update(userID).digest("hex");
        let hashedSessionID = createHash("sha256").update(sessionID).update(apiid).digest("hex");
        
        let allSessions: sessions = JSON.parse(fs.readFileSync(SessionPath, {encoding: "utf-8"}));
        let userSessions = allSessions[hashedUserID];
        
        if(userSessions.indexOf(hashedSessionID) > -1) {
            return true;
        }
        return false;
    }
}