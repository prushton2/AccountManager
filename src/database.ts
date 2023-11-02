import { Account } from "./models/Account";
// import { json } from "body-parser";

import * as fs from "fs";

interface accounts {
    [key: string]: Account
};

let AccountPath: string = "./tables/Accounts.json";

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
    }
}

export const APIHandler = {
    //id is the unhashed id that should come from the url 
    getAPI: (id: string) => {
        
    }
}