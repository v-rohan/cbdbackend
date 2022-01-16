import "reflect-metadata";
import { createConnection } from "typeorm";
import * as express from "express";
import * as bodyParser from "body-parser";
import { Request, Response } from "express";
import { Routes } from "./routes";
import { User } from "./entity/User";
import {port} from "./config";
import * as morgan from "morgan";

function handleError(err, req: Request, res: Response, next: Function) {
    console.error(err)
    res.status(err.statusCode || 500).send(err.message);
}

createConnection().then(async connection => {

    // create express app
    console.log('Connected to application')
    const app = express();
    app.use(morgan('tiny'));
    app.use(bodyParser.json());

    // register express routes from defined application routes
    Routes.forEach(route => {
        (app as any)[route.method](route.route, async (req: Request, res: Response, next: Function) => {
            try {
                const result = await (new (route.controller as any))[route.action](req, res, next);
                res.json(result);
            }
            catch (err) {
                next(err);
            }
        });
    });

    // setup express app here
    // ...
    app.use(handleError);
    // start express server
    app.listen(port);

    // insert new users for test

    console.log(`Express server has started on port ${port}. Open http://localhost:${port}/users to see results`);

}).catch(error => console.log(error));
