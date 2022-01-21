import "reflect-metadata";
import { createConnection } from "typeorm";
import * as express from "express";
import * as bodyParser from "body-parser";
import { Request, Response } from "express";
import * as morgan from "morgan";

import { User } from "./entity/User";
import { port, secretOrKey } from "./config";

var session = require("express-session");
var passport = require("passport");

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

    // register express routes from defined application routes
    require("./routes/userRoutes")(app, passport);
    require("./routes/userInfo")(app, passport);
    app.use(
      "/networks",
      require("./routes/affiliateNetworkRoutes")(app, passport)
    );

    app.use("/logs", require("./routes/postbackLogRoutes")(app, passport));
    // app.use(handleError);

    // setup express app here
    // ...
    // start express server
    app.listen(port);

    // insert new users for test

    console.log(
      `Express server has started on port ${port}. Open http://localhost:${port}/users to see results`
    );
  })
  .catch((error) => console.log(error));
