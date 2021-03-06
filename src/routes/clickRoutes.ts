import { createQueryBuilder, getRepository } from "typeorm";
import { Request, Response, Express } from "express";
import { generateLink } from "../services";
import { IGetUserAuthInfoRequest } from "../types";
import { AdminCheck } from "../middleware/AuthMiddleware";
import { request } from "http";
import { Store } from "../entity/Store";
import { Clicks } from "../entity/Clicks";
import { User } from "../entity/User";

module.exports = (app: Express, passport) => {
    app.post(
        "/click",
        passport.authenticate("jwt", { session: false }),
        async (request: IGetUserAuthInfoRequest, response: Response) => {
            const user = await getRepository(User).findOne(request.user.id);
            if (user.is_email_verified === false) {
                return response.status(400).json({
                    message: "Please verify your email first",
                });
            }
            var click = new Clicks();
            click.user = request.user;
            //  click = { ...click, ...request.body };
            //console.log(request.body);
            click.network = request.body.network;
            click.ipAddress = String(
                request.headers["x-forwarded-for"] ||
                    request.connection.remoteAddress
            );
            click.store = await getRepository(Store).findOneOrFail(
                request.body.store
            );
            click.redirectLink = click.store.affiliate_link.replace(
                /#EULINK/g,
                encodeURIComponent(click.store.homepage)
            );

            getRepository(Clicks)
                .save(click)
                .then((click) => {
                    click.redirectLink = click.redirectLink.replace(
                        /MYCBCLKID/g,
                        String(click.id)
                    );
                    getRepository(Clicks)
                        .save(click)
                        .then(() => {
                            console.log(click)
                            response.status(201).send(click);
                        })
                        .catch((error) => {
                            response.status(500).send(error);
                        });
                })
                .catch((error) => {
                    console.log("----------------------------------------");
                    console.log(error);
                    response.status(401).send(error);
                });
        }
    );

    app.get(
        "/clicks",
        passport.authenticate("jwt", { session: false }),
        async (request: IGetUserAuthInfoRequest, response: Response) => {
            if (request.user.role === "admin") {
                await getRepository(Clicks)
                    .find({
                        relations: ["user", "store", "network"],
                        order: { createdAt: "DESC" },
                    })
                    .then((clicks) => {
                        response.set({
                            "Access-Control-Expose-Headers": "Content-Range",
                            "Content-Range": `X-Total-Count: ${1} - ${clicks.length} / ${
                                clicks.length
                            }`,
                        });
                        response.send(clicks);
                    })
                    .catch((error) => {
                        response.status(401).send(error);
                    });
            } else if (request.user.role === "user") {
                await getRepository(Clicks)
                    .find({
                        relations: ["user", "store", "network"],
                        order: { createdAt: "DESC" },
                        where: { user: request.user },
                    })
                    .then((clicks) => {
                        response.set({
                            "Access-Control-Expose-Headers": "Content-Range",
                            "Content-Range": `X-Total-Count: ${1} - ${clicks.length} / ${
                                clicks.length
                            }`,
                        });
                        response.send(clicks);
                    })
                    .catch((error) => {
                        response.status(401).send(error);
                    });
            } else {
                response.status(401).send("Unauthorized");
            }
        }
    );
};
