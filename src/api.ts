import { Router } from "express";
import { API } from "./models/API";
import { APIHandler, AccountHandler, SessionHandler } from "./database";
import { createHash, randomUUID } from "crypto";
import { Account } from "./models/Account";
export const apiRouter = Router();


apiRouter.post("/new/", async(req: any, res) => {
    if(!SessionHandler.verifySession(req.cookies.token)) {
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
    newAPI.id = createHash("sha256").update(randomUUID()).digest("hex");
    newAPI.keys = [];

    if(!APIHandler.createAPI(newAPI)) {
        res.status(400);
        res.send({"response": "", "error": "API Already Exists"});
        return;
    }
    
    res.status(200);
    res.send({"response": newAPI, "error": ""});
})

apiRouter.post("/authorizeAPI/",async (req:any, res) => {
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

    let API = APIHandler.getAPI(req.body.APIID);

    if(API == undefined) {
        res.status(401);
        res.send({"response": "", "error": "Invalid API"});
        return;
    }
    
    AccountHandler.authorizeAPI(account.id, API.id);

    res.status(200);
    res.send({"response": "Authorized API", "error": ""});
})