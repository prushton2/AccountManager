import { API } from "./models/API";
import { Account } from "./models/Account";
// import { json } from "body-parser";

import * as fs from "fs";

interface accounts {
    [key: string]: Account
};

interface apis {
    [key: string]: API
};

let AccountPath: string = "./tables/Accounts.json";
let APIPath: string = "./tables/APIs.json";

export const AccountHandler = {
    getAccount: (id: string) => {
        let accountData: {} = JSON.parse(fs.readFileSync(AccountPath, {encoding: "utf-8"}));
        let Account: Account = accountData[id as keyof typeof accountData] as Account;
        Account["id"] = id;
        return Account;
    },
    
    createAccount: (account: Account) => {
        let accountData: accounts = JSON.parse(fs.readFileSync(AccountPath, {encoding: "utf-8"}));
        // let newAccountData: {} = {...accountData, }
        accountData[account.id] = account;
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
    }
}

export const APIHandler = {
    //id is the unhashed id that should come from the url 
    getAPI: (id: string) => {
        let APIData: apis = JSON.parse(fs.readFileSync(APIPath, {encoding: "utf-8"}));
        let Api: API = APIData[id];
        Api.id = id;
        return Api
    },

    createAPI: (api: API) => {
        let APIData: apis = JSON.parse(fs.readFileSync(APIPath, {encoding: "utf-8"}));
        APIData[api.id] = api;
        fs.writeFileSync(APIPath, JSON.stringify(APIData), {encoding: "utf-8"});
    }
}