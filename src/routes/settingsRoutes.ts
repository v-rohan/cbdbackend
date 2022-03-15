import { getManager, getRepository } from "typeorm";
import { NextFunction, Request, Response, Express } from "express";
import { IGetUserAuthInfoRequest } from "../types";
import { AdminCheck } from "../middleware/AuthMiddleware";
import multer = require("multer");

import { Settings } from "../entity/Settings";

module.exports = (app: Express, passport) => {
    require("../passport/jwt")(passport);
    require("../passport/google")(passport);

    app.post(
        "/settings",
        passport.authenticate("jwt", { session: false }),
        AdminCheck,
        async (req: IGetUserAuthInfoRequest, res: Response) => {
            try {
                var settings = new Settings();
                settings = getRepository(Settings).find()[0];
                if (!settings) {
                    settings = new Settings();
                }
                settings = { ...settings, ...req.body };
                await getRepository(Settings).save(settings);
                res.status(200).send(settings);
            } catch (e) {
                console.log(e);
                res.status(500).send(e);
            }
        }
    );

    app.get(
        "/settings",
        passport.authenticate("jwt", { session: false }),
        AdminCheck,
        async (req: IGetUserAuthInfoRequest, res: Response) => {
            try {
                var settings = new Settings();
                settings = getRepository(Settings).find()[0];
                if (!settings) {
                    settings = new Settings();
                }
                res.status(200).send(settings);
            } catch (e) {
                console.log(e);
                res.status(500).send(e);
            }
        }
    );
};
