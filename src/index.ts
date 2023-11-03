import Express from "express";
import cookieParser from "cookie-parser";
import bodyParser from "body-parser";
// import { CorsOptions } from "cors";

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
    console.log("Database is ready")

    app.listen(port,() => {
        console.log(`App listening on port ${port}`)
    })
    

    
}
onStart()

app.use("/account", accountRouter);
app.use("/api", apiRouter);

app.get("/", async(req, res) => {
    res.status(200);
    res.send("Worked");
})

app.all("*", async(req, res) => {
    res.status(404);
    res.send({"response": "Endpoint does not exist"});
})