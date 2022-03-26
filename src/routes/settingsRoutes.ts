import { getManager, getRepository } from "typeorm";
import { NextFunction, Request, Response, Express } from "express";
import { IGetUserAuthInfoRequest } from "../types";
import { AdminCheck } from "../middleware/AuthMiddleware";
import multer = require("multer");

import { Settings } from "../entity/Settings";

module.exports = (app: Express, passport) => {
    require("../passport/jwt")(passport);
    require("../passport/google")(passport);

    app.put(
        "/settings/:id",
        passport.authenticate("jwt", { session: false }),
        AdminCheck,
        async (req: IGetUserAuthInfoRequest, res: Response) => {
            var settings = new Settings();
            try {
                settings = await getRepository(Settings).findOneOrFail(
                    req.params.id
                );
                settings = { ...settings, ...req.body };
                getRepository(Settings)
                    .save(settings)
                    .then((settings) => {
                        res.status(201).send(settings);
                    })
                    .catch((error) => {
                        res.status(400).send(error);
                    });
            } catch (error) {
                console.log(error);
                res.status(500).send(error);
            }
        }
    );

    app.get(
        "/settings",
        passport.authenticate("jwt", { session: false }),
        AdminCheck,
        async (req: IGetUserAuthInfoRequest, res: Response) => {
            try {
                const settings = await getRepository(Settings).find();
                res.set({
                    "Access-Control-Expose-Headers": "Content-Range",
                    "Content-Range": `X-Total-Count: 1`,
                });
                res.status(200).send(settings);
            } catch (e) {
                console.log(e);
                res.status(500).send(e);
            }
        }
    );
};
