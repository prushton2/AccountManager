import { Router } from "express";
import { API } from "./models/API";
import { APIHandler, AccountHandler, SessionHandler } from "./database";
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

    if(!newAPI.name || !newAPI.returnAddress) {
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
    
    let account: Account | false = await AccountHandler.getAccount(req.cookies.token.split(".")[0]);
    
    if(account == false) {
        res.status(500);
        res.send({"response": "", "error": "Somehow your account passed verification but doesnt exist..."});
        return;
    }

    if(!req.body.apiid) {
        res.status(400);
        res.send({"response": "", "error": "Missing API ID"});
    }
    
    if(account.ownedAPIs.indexOf(req.body.apiid) == -1) {
        res.status(401);
        res.send({"response": "", "error": "You do not own this API"});
        return;
    }
    
    let key = await APIHandler.createAPIKey(req.body.apiid);
    
    console.log("D");
    res.status(200);
    res.send({"response": key, "error": ""});
    return;    
})

apiRouter.get("/info/", async (req: any, res) => {

    if(!req.query.apiid) {
        res.status(400);
        res.send({"response": "", "error": "No API Key Provided"});
        return;
    }

    let api: API | false = await APIHandler.getAPI(req.query.apiid);

    if(api == false) {
        res.status(400);
        res.send({"response": "", "error": "No API Exists"});
        return;
    }

    res.status(200);
    res.send({"response": await APIHandler.getExternalFacingFilteredAPI(req.query.apiid), "error": ""});
})