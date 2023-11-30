import { Router } from "express";
import { API } from "./models/API";
import { APIHandler, AccountHandler, SessionHandler } from "./database";
import { createHash, randomUUID } from "crypto";
import { Account } from "./models/Account";
export const apiRouter = Router();


apiRouter.post("/new/", async(req: any, res) => {
    if(!process.env.SERVICE_API_ID) {
        res.status(500);
        res.send({"response": "", "error": "service api not defined"});
        return;
    }

    if(!SessionHandler.verifySession(req.cookies.token, process.env.SERVICE_API_ID)) { //user must be logged into the service api to make this change
        res.status(401);
        res.send({"response": "", "error": "Invalid Login"});
        return;
    }

    
    let newAPI = req.body as API;
    //input validation

    if(!newAPI.name) {
        res.status(400);
        res.send({"response": "", "error": "Missing fields"});
        return;
    }

    //user cant change these :)
    newAPI.keys = [];

    if(!APIHandler.createAPI(newAPI)) {
        res.status(400);
        res.send({"response": "", "error": "API Already Exists"});
        return;
    }
    
    AccountHandler.nowOwnsAPI(req.cookies.token.split(".")[0], newAPI._id.toString());

    res.status(200);
    res.send({"response": newAPI, "error": ""});
    return;
})

apiRouter.post("/createAPIKey", async(req: any, res) => {
    
    if(!process.env.SERVICE_API_ID) {
        res.status(500);
        res.send({"response": "", "error": "service api not defined"});
        return;
    }
    
    if(!await SessionHandler.verifySession(req.cookies.token, process.env.SERVICE_API_ID)) {
        res.status(401);
        res.send({"response": "", "error": "Invalid Login"});
        return;
    }
    console.log("A");
    let account: Account | false = await AccountHandler.getAccount(req.cookies.token.split(".")[0]);
    
    if(account == false) {
        res.status(500);
        res.send({"response": "", "error": "Somehow your account passed verification but doesnt exist..."});
        return;
    }
    
    console.log("B");
    if(account.ownedAPIs.indexOf(req.body.apiid) == -1) {
        res.status(401);
        res.send({"response": "", "error": "You do not own this API"});
        return;
    }
    
    console.log("C");
    let key = await APIHandler.createAPIKey(req.body.apiid);
    
    console.log("D");
    res.status(200);
    res.send({"response": key, "error": ""});
    return;    
})