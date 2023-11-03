import { Router } from "express";
import { API } from "./models/API";
import { APIHandler } from "./database";
import { createHash } from "crypto";
export const apiRouter = Router();


apiRouter.post("/new/", async(req: any, res) => {
    let newAPI = req.body as API;

    //input validation

    if(!newAPI.name) {
        res.status(400);
        res.send({"response": "", "error": "Missing fields"});
        return;
    }

    //user cant change these :)
    newAPI.id = "0";
    newAPI.keys = [];

    
    APIHandler.createAPI(newAPI);
    res.status(200);
    res.send({"response": "Created API", "error": ""});
})