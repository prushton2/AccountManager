import { Router } from "express";
import { API } from "./models/API";
import { APIHandler, SessionHandler } from "./database";
import { createHash, randomUUID } from "crypto";
export const apiRouter = Router();


apiRouter.post("/new/", async(req: any, res) => {
    if(!SessionHandler.verifySession(req.cookies.token, "0")) {
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