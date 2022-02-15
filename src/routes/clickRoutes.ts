import { createQueryBuilder, getRepository } from "typeorm";
import { Request, Response, Express } from "express";
import { generateLink } from "../services";
import { IGetUserAuthInfoRequest } from "../types";
import { AdminCheck } from "../middleware/AuthMiddleware";
import { request } from "http";
import { Store } from "../entity/Store";
import { Clicks } from "../entity/Clicks";

module.exports = (app: Express, passport) => {
    app.post(
        "/click",
        passport.authenticate("jwt", { session: false }),
        async (request: IGetUserAuthInfoRequest, response: Response) => {
            var click = new Clicks();
            click.user = request.user;
            click = { ...click, ...request.body };
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
                        /MYCBDCLKID/g,
                        String(click.id)
                    );
                    getRepository(Clicks)
                        .save(click)
                        .then(() => {
                            response.status(201).send(click);
                        })
                        .catch((error) => {
                            response.status(500).send(error);
                        });
                })
                .catch((error) => {
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
