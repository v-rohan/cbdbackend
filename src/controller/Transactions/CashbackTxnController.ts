import { NextFunction, Request, Response } from "express";
import { getRepository } from "typeorm";
import { CashbackTxn } from "../../entity/Transactions/CashbackTxn";
import { IGetUserAuthInfoRequest } from "../../types";

const getCashbackTxns = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    var txns = await getRepository(CashbackTxn).find({
        relations: ["user", "store", "network_id", "click_id"],
    });
    res.set({
        "Access-Control-Expose-Headers": "Content-Range",
        "Content-Range": `X-Total-Count: ${1} - ${txns.length} / ${
            txns.length
        }`,
    })
    res.status(200).json(txns);
};

const postCashbackTxns = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    var newTxn = req.body;
    await getRepository(CashbackTxn).save(newTxn);
    res.status(201).json(newTxn);
};

const getCashbackTxn = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    var txn = await getRepository(CashbackTxn).findOne(req.params.id, {
        relations: ["user", "store", "network_id", "click_id"],
    });
    res.status(200).json(txn);
};

const postCashbackTxn = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    var txn = await getRepository(CashbackTxn).findOne(req.params.id);
    txn = { ...txn, ...req.body };
    await getRepository(CashbackTxn).save(txn);
    res.status(201).json(txn);
};

const createorUpdateCashbackTxn = async (data: any) => {
    try {
        var cashbackTxn = new CashbackTxn();
        await getRepository(CashbackTxn).save(cashbackTxn);
    } catch (e) {
        console.log(e);
        throw e;
    }
};

const deleteCashbackTxn = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    await getRepository(CashbackTxn).delete(req.params.id);
    res.status(204).send();
};

const getCashbackTxnByUser = async (req: IGetUserAuthInfoRequest, res: Response, next: NextFunction) => {
    const cashTxns = await getRepository(CashbackTxn).find({
        where: {user: req.user},
        relations: ["store", "network_id"]
    })
    res.status(200).json(cashTxns);
}

export {
    getCashbackTxns,
    postCashbackTxns,
    createorUpdateCashbackTxn,
    getCashbackTxn,
    postCashbackTxn,
    deleteCashbackTxn,
    getCashbackTxnByUser
};
