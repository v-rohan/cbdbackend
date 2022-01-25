import { createQueryBuilder, getRepository } from "typeorm";
import { Request, Response, Express } from "express";
import { generateLink } from "../services";
import { IGetUserAuthInfoRequest } from "../types";
import AdminCheck from "../middleware/AdminCheck";
import { request } from "http";
import { Store } from "../entity/Store";
import { Clicks } from "../entity/Clicks";

module.exports = (app: Express, passport) => {

    app.post('/click', passport.authenticate("jwt", { session: false }), (request: IGetUserAuthInfoRequest, response: Response) => {
        var click = new Clicks();
        click.user = request.user;
        click = { ...click, ...request.body };
        getRepository(Clicks).save(click).then(click => {
            response.status(201).send(click);
        }).catch(error => {
            response.status(401).send(error);
        })
    })

    app.get('/clicks', passport.authenticate("jwt", { session: false }), async (request: IGetUserAuthInfoRequest, response: Response) => {
        if (request.user.role === "admin") {
            await getRepository(Clicks).find({ relations: ["user", "store", "network"], order: { createdAt: "DESC" } }).then(clicks => {
                response.send(clicks);
            }).catch(error => {
                response.status(401).send(error);
            })
        } else if (request.user.role === "user") {
            await getRepository(Clicks).find({ relations: ["user", "store", "network"], order: { createdAt: "DESC" }, where: { user: request.user } }).then(clicks => {
                response.send(clicks);
            }).catch(error => {
                response.status(401).send(error);
            })
        } else {
            response.status(401).send('Unauthorized');
        }
    })

}