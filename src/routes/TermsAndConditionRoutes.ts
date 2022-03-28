import { Request, Express, Response } from "express";
import * as express from "express";
import { AdminCheck, AdminCheckAllowSafe } from "../middleware/AuthMiddleware";
import { getRepository } from "typeorm";
import { TermsAndCondition } from "../entity/TermsAndConditon";

module.exports = (app: Express, passport: any) => {
    require("../passport/jwt")(passport);
    require("../passport/google")(passport);

    var router = express.Router();

    // Middleware
    router.use(passport.authenticate(["jwt", "anonymous"], { session: false }));
    router.use(AdminCheckAllowSafe);

    // MockTxn Routes
    router.get("/", async (req: Request, res: Response) => {
        try {
            const terms = await getRepository(TermsAndCondition).find();
            return res.status(200).json(terms);
        } catch (err) {
            return res.status(400).json({ err });
        }
    });

    router.post("/", async (req: Request, res: Response) => {
        try {
            let term = new TermsAndCondition();
            term = { ...req.body };
            await getRepository(TermsAndCondition).save(term);
        } catch (err) {
            return res.status(400).json({ err });
        }
    });

    router.get("/:id", async (req: Request, res: Response) => {
        try {
            const term = await getRepository(TermsAndCondition).findOneOrFail({
                where: { id: Number(req.params.id) },
            });
            return res.status(200).json(term);
        } catch (err) {
            return res.status(400).json({ err });
        }
    });

    router.delete("/:id", async (req: Request, res: Response) => {
        try {
            const term = await getRepository(TermsAndCondition).findOneOrFail({
                where: { id: Number(req.params.id) },
            });
            await getRepository(TermsAndCondition).remove(term);
            return res.status(200).json({ message: "Deleted" });
        } catch (err) {
            return res.status(400).json({ err });
        }
    });

    return router;
};
