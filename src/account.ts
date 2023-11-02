import { Router } from "express";
import { AccountHandler } from "./database";
import { Account } from "./models/Account";
import { createHash } from "crypto";
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
    newAccount.id = "0";
    newAccount.allowedAPIKeys = [];
    newAccount.createdAt = 0;
    newAccount.APIKeys = [];
    newAccount.password = createHash('sha256').update(newAccount.password).digest("hex");

    
    AccountHandler.createAccount(newAccount);
    res.status(200);
    res.send({"response": "Created Account", "error": "none"});
})

accountRouter.post("/login/", async(req, res) => {
    res.status(200);
    res.send(AccountHandler.getAccount("0"));
})

//create account
//login
//logout
//delete account
//reset password
