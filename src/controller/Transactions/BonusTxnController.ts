import { NextFunction, Request, Response } from "express";
import { Between, getRepository, LessThanOrEqual, MoreThanOrEqual } from "typeorm";
import { BonusTxn } from "../../entity/Transactions/BonusTxn";
import { CashbackTxn } from "../../entity/Transactions/CashbackTxn";
import { AcceptedStatusOpts } from "../../entity/Transactions/Common";
import { IGetUserAuthInfoRequest } from "../../types";

const getBonusTxns = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    var txns = await getRepository(BonusTxn).find();
    res.set({
        "Access-Control-Expose-Headers": "Content-Range",
        "Content-Range": `X-Total-Count: ${1} - ${txns.length} / ${
            txns.length
        }`,
    })
    res.status(200).json(txns);
};

const postBonusTxn = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    var newTxn = req.body;
    await getRepository(BonusTxn).save(newTxn);
    res.status(201).json(newTxn);
};

const getBonusTxn = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    var txn = await getRepository(BonusTxn).findOne(req.params.id);
    res.status(200).json(txn);
};

const updateBonusTxn = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    var txn = await getRepository(BonusTxn).findOne(req.params.id);
    txn = { ...txn, ...req.body };
    await getRepository(BonusTxn).save(txn);
    res.status(201).json(txn);
};

const deleteBonusTxn = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    await getRepository(BonusTxn).delete(req.params.id);
    res.status(204).send();
};

export {
    getBonusTxns,
    postBonusTxn,
    getBonusTxn,
    updateBonusTxn,
    deleteBonusTxn,
};
