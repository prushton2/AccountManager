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



// // src/proxy.ts
// var proxy_default = {
//   async fetch(request, env, ctx) {
//     const url = new URL(request.url);
//     const proxyUrl = url.searchParams.get("proxyUrl");
//     const modify = url.searchParams.has("modify");
//     if (!proxyUrl) {
//       return new Response("Bad request: Missing `proxyUrl` query param", { status: 400 });
//     }
//     let res = await fetch(proxyUrl, request);
//     if (modify) {
//       res = new Response(res.body, res);
//       res.headers.set("X-My-Header", "My Header Value");
//     }
//     return res;
//   }
// };

// // src/redirect.ts
// var redirect_default = {
//   async fetch(request, env, ctx) {
//     const url = new URL(request.url);
//     const redirectUrl = url.searchParams.get("redirectUrl");
//     if (!redirectUrl) {
//       return new Response("Bad request: Missing `redirectUrl` query param", { status: 400 });
//     }
//     return Response.redirect(redirectUrl);
//   }
// };

// // node_modules/itty-router/dist/itty-router.mjs
// var e = ({ base: e2 = "", routes: r = [] } = {}) => ({ __proto__: new Proxy({}, { get: (a, o, t) => (a2, ...p) => r.push([o.toUpperCase(), RegExp(`^${(e2 + a2).replace(/(\/?)\*/g, "($1.*)?").replace(/(\/$)|((?<=\/)\/)/, "").replace(/(:(\w+)\+)/, "(?<$2>.*)").replace(/:(\w+)(\?)?(\.)?/g, "$2(?<$1>[^/]+)$2$3").replace(/\.(?=[\w(])/, "\\.").replace(/\)\.\?\(([^\[]+)\[\^/g, "?)\\.?($1(?<=\\.)[^\\.")}/*$`), p]) && t }), routes: r, async handle(e3, ...a) {
//   let o, t, p = new URL(e3.url), l = e3.query = {};
//   for (let [e4, r2] of p.searchParams)
//     l[e4] = void 0 === l[e4] ? r2 : [l[e4], r2].flat();
//   for (let [l2, s, c] of r)
//     if ((l2 === e3.method || "ALL" === l2) && (t = p.pathname.match(s))) {
//       e3.params = t.groups || {};
//       for (let r2 of c)
//         if (void 0 !== (o = await r2(e3.proxy || e3, ...a)))
//           return o;
//     }
// } });

// // src/router.ts
// var router = e();
// router.get("/api/todos", () => new Response("Todos Index!"));
// router.get("/api/todos/:id", ({ params }) => new Response(`Todo #${params.id}`));
// router.post("/api/todos", async (request) => {
//   const content = await request.json();
//   return new Response("Creating Todo: " + JSON.stringify(content));
// });
// router.all("*", () => new Response("Not Found.", { status: 404 }));
// var router_default = router;

// // src/index.ts
// var src_default = {
//   // The fetch handler is invoked when this worker receives a HTTP(S) request
//   // and should return a Response (optionally wrapped in a Promise)
//   async fetch(request, env, ctx) {
//     const url = new URL(request.url);
//     switch (url.pathname) {
//       case "/redirect":
//         return redirect_default.fetch(request, env, ctx);
//       case "/proxy":
//         return proxy_default.fetch(request, env, ctx);
//     }
//     if (url.pathname.startsWith("/api/")) {
//       return router_default.handle(request);
//     }
//     return new Response(
//       `Try making requests to:
//       <ul>
//       <li><code><a href="/redirect?redirectUrl=https://example.com/">/redirect?redirectUrl=https://example.com/</a></code>,</li>
//       <li><code><a href="/proxy?modify&proxyUrl=https://example.com/">/proxy?modify&proxyUrl=https://example.com/</a></code>, or</li>
//       <li><code><a href="/api/todos">/api/todos</a></code></li>`,
//       { headers: { "Content-Type": "text/html" } }
//     );
//   }
// };
// export {
//   src_default as default
// };
// //# sourceMappingURL=index.js.map
