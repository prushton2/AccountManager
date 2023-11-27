import { Router } from "express";
import { APIHandler, AccountHandler, SessionHandler } from "./database";
import { Account } from "./models/Account";
import { createHash, randomUUID } from "crypto";
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
    newAccount.allowedAPIs = [];
    newAccount.createdAt = Date.now();
    newAccount.ownedAPIs = [];
    newAccount.password = createHash('sha256').update(newAccount.password).digest("hex");


    AccountHandler.createAccount(newAccount);
    res.status(200);
    res.send({"response": "Created Account", "error": "none"});
})

accountRouter.post("/login/", async(req: any, res) => {
    
    let account: Account = await AccountHandler.getAccountByName(req.body.name);
    let API: API = await APIHandler.getAPI(req.query.api);
    
    console.log(API);
    console.log(account);

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


    let sessionID = createHash("sha256").update(randomUUID()).digest("hex");

    //we give the unhashed version to the handler, it hashes it
    SessionHandler.createSession(account._id, sessionID, req.query.api);

    //we send back the unhashed version
    res.status(200);
    res.send({"response": {"token": `${account._id.id}.${sessionID}`, "redirectTo": `${API.returnAddress}?token=${account._id.id}.${sessionID}`}, "error": ""});
})


accountRouter.get("/info/", async (req: any, res) => {

    // if(!SessionHandler.verifySession(req.cookies.token, req.query.api)) {
    //     res.status(401);
    //     res.send({"response": "", "error": "Invalid Login"});
    //     return;
    // }

    res.status(200);
    res.send({"response": await AccountHandler.getExternalFacingFilteredAccount(req.cookies.token.split(".")[0])});
})

accountRouter.get("/authenticate/",async (req:any, body) => {
    
})

//create account
//login
//logout
//delete account
//reset password