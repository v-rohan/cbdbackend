import { getManager, getRepository } from "typeorm";
import { Request, Response, Express } from "express";
import { generateLink } from "../services";
import { SnE } from "../entity/SnE";
import { IGetUserAuthInfoRequest } from "../types";
import AdminCheck from "../middleware/AdminCheck";
import { Store } from "../entity/Store";
import { Clicks } from "../entity/Clicks";

module.exports = (app: Express, passport) => {
    app.post(
        "/links",
        passport.authenticate("jwt", { session: false }),
        (request: IGetUserAuthInfoRequest, response: Response) => {
            var link = generateLink();
            var sne = new SnE();
            sne.user = request.user;
            sne.shortlink = link;
            sne.store = request.body.store;
            getRepository(SnE)
                .save(sne)
                .then((sne) => {
                    response.status(201).send(sne);
                })
                .catch((error) => {
                    response.status(400).send(error);
                });
        }
    );

    app.get("/c/:shortlink", async (request: Request, response: Response) => {
        var store: any;
        var click = new Clicks();
        try {
            var sne: SnE = await getRepository(SnE).findOneOrFail(
                { shortlink: request.params.shortlink },
                { relations: ["store", "user"] }
            );

            click.user = sne.user;
            click.store = sne.store;
            store = sne.store;

            await getManager()
                .transaction(async (transactionalEntityManager) => {
                    await transactionalEntityManager
                        .update(SnE, { id: sne.id }, { clicks: sne.clicks + 1 })
                        .catch((error) => {
                            throw error;
                        });

                    await getRepository(Store)
                        .findOneOrFail(
                            { id: store.id },
                            { relations: ["network"] }
                        )
                        .then((storeq) => {
                            click.network = storeq.network;
                        })
                        .catch((error) => {
                            console.log(error);
                            throw error;
                        });
                    click.ipAddress = String(
                        request.headers["x-forwarded-for"] ||
                            request.connection.remoteAddress
                    );
                    console.log(click);
                    await transactionalEntityManager
                        .save(click)
                        .catch((error) => {
                            throw error;
                        });
                })
                .then(async () => {
                    response.send(store.affiliateLink);
                })
                .catch((error) => {
                    throw error;
                });
        } catch (error) {
            response.status(400).send(error);
        }
    });

    app.get(
        "/links",
        passport.authenticate("jwt", { session: false }),
        async (request: IGetUserAuthInfoRequest, response: Response) => {
            if (request.user.role === "admin") {
                await getRepository(SnE)
                    .find({
                        relations: ["user", "store"],
                        order: { createdAt: "DESC" },
                    })
                    .then((links) => {
                        response.send(links);
                    })
                    .catch((error) => {
                        response.status(401).send(error);
                    });
            } else {
                await getRepository(SnE)
                    .find({
                        relations: ["store"],
                        where: { user: request.user },
                        order: {
                            createdAt: "DESC",
                        },
                    })
                    .then((links) => {
                        response.send(links);
                    })
                    .catch((error) => {
                        console.log(error);
                        response.status(401).send(error);
                    });
            }
        }
    );

    app.get(
        "/links/:id",
        passport.authenticate("jwt", { session: false }),
        AdminCheck,
        async (request: IGetUserAuthInfoRequest, response: Response) => {
            await getRepository(SnE)
                .findOneOrFail({
                    relations: ["user", "store"],
                    order: { createdAt: "DESC" },
                    where: { id: Number(request.params.id) },
                })
                .then((link) => {
                    response.send(link);
                })
                .catch((error) => {
                    response.status(401).send(error);
                });
        }
    );

    app.put(
        "/links/:id",
        passport.authenticate("jwt", { session: false }),
        AdminCheck,
        async (request: IGetUserAuthInfoRequest, response: Response) => {
            await getRepository(SnE)
                .findOneOrFail({ id: Number(request.params.id) })
                .then((link) => {
                    getRepository(SnE).merge(link, { ...request.body });
                    getRepository(SnE)
                        .save(link)
                        .then((updatedlink) => {
                            response.send(updatedlink);
                        });
                })
                .catch((error) => {
                    response.status(404).send(error);
                });
        }
    );

    app.delete(
        "/links/:id",
        passport.authenticate("jwt", { session: false }),
        AdminCheck,
        async (request: IGetUserAuthInfoRequest, response: Response) => {
            await getRepository(SnE)
                .delete({ id: Number(request.params.id) })
                .then(() => {
                    response.send("deleted");
                });
        }
    );
};
