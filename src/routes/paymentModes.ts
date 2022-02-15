import { getRepository } from "typeorm";
import { NextFunction, Request, Response, Express } from "express";
import { IGetUserAuthInfoRequest } from "../types";
import { Mode, PaymentMode } from "../entity/Payment/PaymentMode";
import e = require("express");
import { AdminCheck } from "../middleware/AuthMiddleware";

module.exports = (app: Express, passport) => {
    require("../passport/jwt")(passport);
    require("../passport/google")(passport);

    //signup
    app.post(
        "/mode",
        passport.authenticate("jwt", { session: false }),
        (
            request: IGetUserAuthInfoRequest,
            response: Response,
            next: NextFunction
        ) => {
            var newMode = new PaymentMode();
            newMode.user = request.user;
            newMode = { ...request.body, ...newMode };
            switch (request.body.platform) {
                case "paytm":
                    newMode.method_code = Mode.paytm;
                    break;
                case "bank":
                    newMode.method_code = Mode.bank;
                    break;
                default:
                    break;
            }
            console.log(newMode);
            getRepository(PaymentMode)
                .save(newMode)
                .then((mode) => {
                    response.status(201).send(mode);
                })
                .catch((error) => {
                    console.log(error);
                    response.status(403).send(error);
                });
        }
    );

    app.get(
        "/mode",
        passport.authenticate("jwt", { session: false }),
        async (request: IGetUserAuthInfoRequest, response: Response) => {
            if (request.user.role === "admin") {
                await getRepository(PaymentMode)
                    .find({
                        relations: ["user"],
                        order: { created_at: "DESC" },
                    })
                    .then((modes) => {
                        response.send(modes);
                    })
                    .catch((error) => {
                        response.status(401).send(error);
                    });
            } else if (request.user.role === "user") {
                await getRepository(PaymentMode)
                    .find({
                        relations: ["user"],
                        order: { created_at: "DESC" },
                        where: { user: request.user },
                    })
                    .then((modes) => {
                        console.log(modes);
                        console.log(request.user);
                        response.status(200).send(modes);
                    })
                    .catch((error) => {
                        console.log(error);
                        response.status(403).send(error);
                    });
            } else {
                response.status(401).send("Unauthorized");
            }
        }
    );

    app.get(
        "/mode/:id",
        passport.authenticate("jwt", { session: false }),
        AdminCheck,
        async (request: IGetUserAuthInfoRequest, response: Response) => {
            await getRepository(PaymentMode)
                .findOne({
                    relations: ["user"],
                    where: { id: request.params.id },
                })
                .then((mode) => {
                    response.send(mode);
                })
                .catch((error) => {
                    response.status(403).send(error);
                });
        }
    );

    app.put(
        "/mode/:id",
        passport.authenticate("jwt", { session: false }),
        async (request: IGetUserAuthInfoRequest, response: Response) => {
            await getRepository(PaymentMode)
                .findOneOrFail({ id: Number(request.params.id) })
                .then((paymentMode) => {
                    if (
                        request.user.role === "admin" ||
                        paymentMode.user.id === request.user.id
                    ) {
                        getRepository(PaymentMode).merge(paymentMode, {
                            ...request.body,
                        });
                        getRepository(PaymentMode)
                            .save(paymentMode)
                            .then((updatedpaymentMode) => {
                                response.send(updatedpaymentMode);
                            });
                    } else
                        response
                            .status(403)
                            .send(
                                "You are not authorized to perform this action"
                            );
                })
                .catch((error) => {
                    response.status(404).send(error);
                });
        }
    );

    app.delete(
        "/mode/:id",
        passport.authenticate("jwt", { session: false }),
        async (request: IGetUserAuthInfoRequest, response: Response) => {
            await getRepository(PaymentMode)
                .findOneOrFail({ id: Number(request.params.id) })
                .then((paymentMode) => {
                    if (
                        request.user.role === "admin" ||
                        paymentMode.user.id === request.user.id
                    ) {
                        getRepository(PaymentMode)
                            .remove(paymentMode)
                            .then(() => {
                                response.send("deleted");
                            });
                    } else
                        response
                            .status(403)
                            .send(
                                "You are not authorized to perform this action"
                            );
                })
                .catch((error) => {
                    response.status(404).send(error);
                });
        }
    );
};
