import { Router } from "express";
import { AccountHandler, SessionHandler } from "./database";
import { Account } from "./models/Account";
import { createHash, randomUUID } from "crypto";
import { FilteredAccount } from "./models/FilteredAcount";
export const accountRouter = Router();



accountRouter.post("/new/", async(req: any, res) => {


    let newAccount = req.body as Account;

    //input validation

    if(!newAccount.name || !newAccount.email || !newAccount.password) {
        res.status(400);
        res.send({"response": "", "error": "Missing fields"});
        return;
    }

    //user cant change these :)
    newAccount.id = createHash("sha256").update(randomUUID()).digest("hex");
    newAccount.allowedAPIKeys = [];
    newAccount.createdAt = Date.now();
    newAccount.APIKeys = [];
    newAccount.password = createHash('sha256').update(newAccount.password).digest("hex");


    AccountHandler.createAccount(newAccount);
    res.status(200);
    res.send({"response": "Created Account", "error": "none"});
})

accountRouter.post("/login/", async(req: any, res) => {
    
    let account: Account | undefined = AccountHandler.getAccountByName(req.body.name);
    
    if(account == undefined) {
        res.status(400);
        res.send({"response": "", "error": "No Account Found"})
        return;
    }

    if(createHash('sha256').update(req.body.password).digest('hex') != account.password) {
        res.status(401);
        res.send({"response": "", "error": "Invalid Password"});
        return;
    }

    let filteredAccount: FilteredAccount = {
        name: account.name,
        email: account.email,
        APIKeys: account.APIKeys,
        createdAt: account.createdAt,
        allowedAPIKeys: account.allowedAPIKeys
    };

    let sessionID = createHash("sha256").update(randomUUID()).digest("hex");

    SessionHandler.createSession(account.id, sessionID);

    res.status(200);
    res.send({"response": {"account": filteredAccount, "token": `${account.id}.${sessionID}`}, "error": ""});
})


accountRouter.get("/info/", async (req: any, res) => {

    if(!SessionHandler.verifySession(req.cookies.token)) {
        res.status(401);
        res.send({"response": "", "error": "Invalid Login"});
        return;
    }

    res.status(200);
    res.send({"response": AccountHandler.getFilteredAccount(req.cookies.token.split(".")[0])});
})

//create account
//login
//logout
//delete account
//reset password