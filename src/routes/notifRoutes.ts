import { getRepository } from "typeorm";
import { NextFunction, Request, Response, Express } from "express";
import { IGetUserAuthInfoRequest } from "../types";
import { Mode, PaymentMode } from "../entity/Payment/PaymentMode";
import e = require("express");
import { AdminCheck } from "../middleware/AuthMiddleware";
import { BankImage } from "../entity/BankImages";
import { Notification } from "../entity/Notifications";

module.exports = (app: Express, passport) => {
    require("../passport/jwt")(passport);
    require("../passport/google")(passport);

    app.post(
        "/notification",
        passport.authenticate("jwt", { session: false }),
        AdminCheck,
        async (request: IGetUserAuthInfoRequest, response: Response) => {
            var notif = new Notification();
            notif = { ...notif, ...request.body };
            getRepository(Notification)
                .save(notif)
                .then((notif) => {
                    response.status(201).send(notif);
                })
                .catch((error) => {
                    response.status(403).send(error);
                });
        }
    );

    app.get(
        "/notification",
        passport.authenticate("jwt", { session: false }),
        async (request: IGetUserAuthInfoRequest, response: Response) => {
            try {
                var notifs = await getRepository(Notification).find({
                    order: { created: "DESC" },
                });
                response.set({
                    "Access-Control-Expose-Headers": "Content-Range",
                    "Content-Range": `X-Total-Count: ${1} - ${notifs.length} / ${
                        notifs.length
                    }`,
                });
                response.status(200).send(notifs);
            } catch (error) {
                response.status(403).send(error);
            }
        }
    );

    app.put(
        "/notification/:id",
        passport.authenticate("jwt", { session: false }),
        AdminCheck,
        async (request: IGetUserAuthInfoRequest, response: Response) => {
            var notif = new Notification();
            try {
                notif = await getRepository(Notification).findOneOrFail(
                    request.params.id
                );
                notif = { ...notif, ...request.body };
                getRepository(Notification)
                    .save(notif)
                    .then((notif) => {
                        response.status(201).send(notif);
                    })
                    .catch((error) => {
                        response.status(400).send(error);
                    });
            } catch (error) {
                response.status(400).send(error);
            }
        }
    );

    app.get(
        "/notification/:id",
        passport.authenticate("jwt", { session: false }),
        AdminCheck,
        async (request: IGetUserAuthInfoRequest, response: Response) => {
            var notif = new Notification();
            try {
                notif = await getRepository(Notification).findOneOrFail(
                    request.params.id
                );
                response.status(200).send(notif);
            } catch (error) {
                response.status(400).send(error);
            }
        }
    );

    app.delete(
        "/notification/:id",
        passport.authenticate("jwt", { session: false }),
        AdminCheck,
        async (request: IGetUserAuthInfoRequest, response: Response) => {
            try {
                await getRepository(Notification)
                    .delete(request.params.id)
                    .then(() => {
                        response.sendStatus(200);
                    })
                    .catch((error) => {
                        throw error;
                    });
            } catch (error) {
                response.status(400).send(error);
            }
        }
    );
};
