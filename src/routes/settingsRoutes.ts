import { getManager, getRepository } from "typeorm";
import { NextFunction, Request, Response, Express } from "express";
import { User, UserRole } from "../entity/User";
import { secretOrKey } from "../config";
import { IGetUserAuthInfoRequest } from "../types";
import { generateLink, passowrdhasher } from "../services";
import { BonusTxn } from "../entity/Transactions/BonusTxn";
import { AdminCheck } from "../middleware/AuthMiddleware";
import multer = require("multer");
import fetch from "node-fetch";
import { amqp, queue, mailgun_apikey, mailgun_url } from "../config";
import * as amqplib from "amqplib/callback_api";
import * as nodemailer from "nodemailer";
import { publishMail } from "../tasks/publishMail";
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
