import Express from "express";
import cookieParser from "cookie-parser";
import bodyParser from "body-parser";
// import { CorsOptions } from "cors";
import { setDB } from "./database";
import * as mongoDB from "mongodb";

const app = Express();
const port = 3000;

//routers
import { accountRouter } from "./account";
import { apiRouter } from "./api";


app.use(cookieParser());

app.use(bodyParser.urlencoded({
  extended: true
}))

app.use(bodyParser.json());


//soon (tm)
// app.use( cors({
//     origin: true,
//     methods: ['GET','POST','DELETE','UPDATE','PUT','PATCH'],
//     credentials: true
// }));


// process.on('uncaughtException', (err) => {
//     console.log(err)
// })

//Archive every tuesday at 11pm
// cron.schedule("0 13 * * 2", () => {
//     archive.archiveDB()
// });

async function onStart() {
    if(false) { //set to true to load the latest save on start
        // await archive.loadLatestSave();
        console.log("Loaded latest archive");
    }

    await setDB();

    // let getclient = database.getClient();
    
    // if(!getclient) {
    //     console.log("DB failed to connect");
    //     return;
    // }
    
    // client = getclient;

    // await client.connect();

    
    
    
    console.log("Database is ready")
    app.listen(port,() => {
        console.log(`App listening on port ${port}`)
    })
    

    
}
onStart()

//url prefix is a setting to allow for this to be nested inside a reverse proxy easier

app.use(`${process.env.URL_PREFIX}/account`, accountRouter);
app.use(`${process.env.URL_PREFIX}/api`, apiRouter);

app.get(`${process.env.URL_PREFIX}/`, async(req, res) => {
    res.status(200);
    res.send("pong");
})

app.all("*", async(req, res) => {
    res.status(404);
    res.send({"response": "Endpoint does not exist"});
})