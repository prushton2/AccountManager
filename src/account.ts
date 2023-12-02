import { Router } from "express";
import { APIHandler, AccountHandler, SessionHandler } from "./database";
import { Account } from "./models/Account";
import { createHash, randomUUID, verify } from "crypto";
import { API } from "./models/API";
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
    // newAccount.id = createHash("sha256").update(randomUUID()).digest("hex");
    newAccount.allowedAPIs = []; //this is useless currently. Leaving it in incase it wont be.
    newAccount.createdAt = Date.now();
    newAccount.ownedAPIs = [];
    newAccount.password = createHash('sha256').update(newAccount.password).digest("hex");


    let accountCreated = await AccountHandler.createAccount(newAccount);
    

    if(!accountCreated) {
        res.status(400);
        res.send({"response": "", "error": "Account by that name already exists"});
        return;
    }

    res.status(200);
    res.send({"response": "Created Account", "error": ""});
})

accountRouter.post("/login/", async(req: any, res) => {
    
    if(!req.body.name || !req.body.apikey || !req.query.api || !req.body.password) {
        res.status(400);
        res.send({"response": "", "error": "Invalid Credentials"});
        return;
    }

    let account: Account = await AccountHandler.getAccountByName(req.body.name);
    let API: API = await APIHandler.getAPI(req.query.api);
    
    if(!await APIHandler.verifyAPIKey(req.query.api, req.body.apikey)) {
        res.status(401);
        res.send({"response": "", "error": "Invalid Credentials"});
        return;
    }

    if(account == undefined) {
        res.status(401);
        res.send({"response": "", "error": "Invalid Credentials"})
        return;
    }

    if(createHash('sha256').update(req.body.password).digest('hex') != account.password) {
        res.status(401);
        res.send({"response": "", "error": "Invalid Credentials"});
        return;
    }

    let sessionID = createHash("sha256").update(randomUUID()).digest("hex");


    //we give the unhashed version to the handler, it hashes it
    await SessionHandler.createSession(account._id, sessionID, req.query.api);

    //we send back the unhashed version
    res.status(200);
    res.send({"response": {"token": `${account._id.toString()}.${sessionID}`, "redirectTo": `${API.returnAddress}?token=${account._id.id.toString()}.${sessionID}`}, "error": ""});
})


accountRouter.get("/info/", async (req: any, res) => {

    if(!await SessionHandler.verifySession(req.cookies.token, req.query.api)) {
        res.status(401);
        res.send({"response": "", "error": "Invalid Login"});
        return;
    }

    res.status(200);
    res.send({"response": await AccountHandler.getExternalFacingFilteredAccount(req.cookies.token.split(".")[0]), "error": ""});
})

accountRouter.get("/logout", async(req:any, res) => {

    if(!await SessionHandler.verifySession(req.cookies.token, req.query.api)) {
        res.status(401);
        res.send({"response": "", "error": "Invalid Login"});
        return;
    }

    await SessionHandler.removeSession(req.cookies.token, req.query.api);
    
    res.status(200);
    res.send({"response": "Logged out", "error": ""});
    return;
})

//create account
//login
//logout
//delete account
//reset password