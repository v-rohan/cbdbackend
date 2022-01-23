import { createQueryBuilder, getRepository } from "typeorm";
import { Request, Response, Express } from "express";
import { generateLink } from "../services";
import { SnE } from "../entity/SnE";
import { IGetUserAuthInfoRequest } from "../types";
import AdminCheck from "../middleware/AdminCheck";
import { request } from "http";

module.exports = (app: Express, passport) => {

    app.post('/links/g', passport.authenticate("jwt", { session: false }), (request: IGetUserAuthInfoRequest, response: Response) => {
        var link = generateLink();
        var sne = new SnE();
        sne.user = request.user;
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

    app.get('/links', passport.authenticate("jwt", { session: false }), AdminCheck, async (request: IGetUserAuthInfoRequest, response: Response) => {
        await getRepository(SnE).find({ relations: ["user"], order: { createdAt: "DESC" } }).then(links => {
            response.send(links);
        }).catch(error => {
            response.status(401).send(error);
        })
    })

    app.get('/links/:id', passport.authenticate("jwt", { session: false }), AdminCheck, async (request: IGetUserAuthInfoRequest, response: Response) => {
        await getRepository(SnE).findOneOrFail({ relations: ["user"], order: { createdAt: "DESC" }, where: { id: Number(request.params.id) } }).then(link => {
            response.send(link);
        }).catch(error => {
            response.status(401).send(error);
        })
    })

    app.put('/links/:id', passport.authenticate("jwt", { session: false }), AdminCheck, async (request: IGetUserAuthInfoRequest, response: Response) => {

        await getRepository(SnE).findOneOrFail({ id: Number(request.params.id) }).then(link => {
            getRepository(SnE).merge(link, { ...request.body });
            getRepository(SnE).save(link).then(updatedlink => {
                response.send(updatedlink);
            })
        }).catch(error => {
            response.status(404).send(error);
        })

    })

    app.delete('/links/:id', passport.authenticate("jwt", { session: false }), AdminCheck, async (request: IGetUserAuthInfoRequest, response: Response) => {
        await getRepository(SnE).delete({ id: Number(request.params.id) }).then(() => {
            response.send("deleted");
        })
    })

    app.get('/links/my', passport.authenticate("jwt", { session: false }), async (request: IGetUserAuthInfoRequest, response: Response) => {
        await getRepository(SnE).find({
            where: { user: request.user }, order: {
                createdAt: "DESC"
            }
        },
        ).then(links => {
            response.send(links);
        }).catch(error => {
            response.status(401).send(error);
        })
    })

}