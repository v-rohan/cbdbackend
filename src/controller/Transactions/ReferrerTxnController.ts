import { NextFunction, Request, Response } from "express";
import { getRepository } from "typeorm";
import { ReferrerTxn } from "../../entity/Transactions/ReferrerTxn";

const getReferrerTxns = async (req: Request, res: Response, next: NextFunction) => {
    var txns = await getRepository(ReferrerTxn).find({ relations: ["store"] });
    res.set({
        "Access-Control-Expose-Headers": "Content-Range",
        "Content-Range": `X-Total-Count: ${1} - ${txns.length} / ${
            txns.length
        }`,
    })
    res.status(200).json(txns);
}

const postReferrerTxns = async (req: Request, res: Response, next: NextFunction) => {
    var newTxn = req.body;
    await getRepository(ReferrerTxn).save(newTxn);
    res.status(201).json(newTxn);
}

const getReferrerTxn = async (req: Request, res: Response, next: NextFunction) => {
    var txn = await getRepository(ReferrerTxn).findOne(
        req.params.id,
        { relations: ["store"] }
    );
    res.status(200).json(txn);
}

const postReferrerTxn = async (req: Request, res: Response, next: NextFunction) => {
    var txn = await getRepository(ReferrerTxn).findOne(req.params.id);
    txn = { ...txn, ...req.body };
    await getRepository(ReferrerTxn).save(txn);
    res.status(201).json(txn);
}

const deleteReferrerTxn = async (req: Request, res: Response, next: NextFunction) => {
    await getRepository(ReferrerTxn).delete(req.params.id);
    res.status(204).send();
}

export {
    getReferrerTxns,
    postReferrerTxns,
    getReferrerTxn,
    postReferrerTxn,
    deleteReferrerTxn
}