import { createQueryBuilder, getRepository } from "typeorm";
import { Request, Response, Express } from "express";
import { generateLink } from "../services";
import { SnE } from "../entity/SnE";
import { IGetUserAuthInfoRequest } from "../types";

module.exports = (app: Express, passport) => {

    app.post('/genlink', (request: Request, response: Response) => {
        var link = generateLink();
        var sne = new SnE();
        sne.shortlink = link;
        sne.link = request.body.link;
        getRepository(SnE).save(sne).then(sne => {
            response.status(201).send(sne);
        }).catch(error => {
            response.status(401).send(error);
        })
    })

    app.get('/c/:shortlink', async (request: Request, response: Response) => {
        var shortlinkparam = request.params.shortlink;

        await createQueryBuilder()
            .update(SnE)
            .set({ clicks: () => "clicks + 1" })
            .where("shortlink = :shortlink", { shortlink: shortlinkparam })
            .returning("link")
            .execute().then(link => {
                response.send(link.raw[0].link);
            }).catch(error => {
                response.status(401).send(error);
            })


    })

    app.get('/links', passport.authenticate("jwt", { session: false }), async (request: IGetUserAuthInfoRequest, response: Response) => {
        if(request.user.role === "admin"){
        await getRepository(SnE).find().then(links => {
            response.send(links);
        }).catch(error => {
            response.status(401).send(error);
        })}
        else
        response.status(401).send("You are not authorized to view this page");
    })

}