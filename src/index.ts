import "reflect-metadata";
import { createConnection } from "typeorm";
import * as express from "express";
import * as bodyParser from "body-parser";
import { Request, Response } from "express";
import * as morgan from "morgan";
const AnonymousStrategy = require("passport-anonymous").Strategy;

import { User } from "./entity/User";
import { port, secretOrKey } from "./config";

var session = require("express-session");
var passport = require("passport");
const cors = require("cors");

function handleError(err, req: Request, res: Response, next: Function) {
    console.error(err);
    res.status(err.statusCode || 500).send(err.message);
}

createConnection()
    .then(async (connection) => {
        // create express app
        console.log("Connected to db");
        const app = express();
        app.use(
            session({
                secret: secretOrKey,
                resave: false,
                saveUninitialized: true,
            })
        ); // session secret

        app.use(passport.initialize());
        app.use(passport.session());
        app.use(morgan("tiny"));
        app.use(bodyParser.json());
        app.use(cors());
        
        passport.use(new AnonymousStrategy());

        // register express routes from defined application routes
        require("./routes/userRoutes")(app, passport);
        require("./routes/clickRoutes")(app, passport);
        require("./routes/sneRoutes")(app, passport);
        require("./routes/paymentModes")(app, passport);
        require("./routes/missingClaimsRoutes")(app, passport);
        app.use("/payoutrequests", require("./routes/userRequestRoutes")(app, passport));
        app.use(
            "/networks",
            require("./routes/affiliateNetworkRoutes")(app, passport)
        );
        app.use("/logs", require("./routes/postbackLogRoutes")(app, passport));
        app.use("/stores", require("./routes/storeRoutes")(app, passport));
        app.use(
            "/cashbackRates",
            require("./routes/cashbackRatesRoutes")(app, passport)
        );
        app.use("/txn", require("./routes/txnRoutes")(app, passport));
        app.use("/banner",require("./routes/bannerRoutes")(app, passport));
        app.use("/account", require("./routes/accountRoutes")(app, passport));
        app.use("/bankimage", require("./routes/bankImageRoutes")(app, passport));
        app.use("/settings", require("./routes/settingsRoutes")(app, passport));

        
        // Serve media files
        app.use("/media", express.static("media"));
        // app.use(handleError);

        // setup express app here
        // ...
        // start express server
        app.listen(port);

        // insert new users for test

        console.log(
            `Express server has started on port ${port}. Open http://localhost:${port}/ to see results`
        );
    })
    .catch((error) => console.log(error));
