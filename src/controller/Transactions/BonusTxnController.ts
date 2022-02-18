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

const getBonusTxnByUser = async (
    req: IGetUserAuthInfoRequest,
    res: Response,
    next: NextFunction
) => {
    const bonusTxns = await getRepository(BonusTxn).find({
        where: { user: req.user },
        order: { awarded_on: "ASC" }
    })
    var currDate = new Date();
    for(let i = 0; i < bonusTxns.length; i++ ) {
        if (bonusTxns[i].status === AcceptedStatusOpts.pending) {
            const cashbacks = await getRepository(CashbackTxn).find({
                where: {
                    user: req.user.id,
                    created_at: Between(bonusTxns[i].awarded_on, bonusTxns[i].expires_on),
                }
            })
            var sum = 0;
            cashbacks.forEach(cshbck => {
                sum += cshbck.cashback;
            })
            try {
                if (sum === 500) {
                    await getRepository(BonusTxn).save({
                        id: bonusTxns[i].id,
                        status: AcceptedStatusOpts.confirmed
                    })
                } else if (currDate > bonusTxns[i].expires_on) {
                    await getRepository(BonusTxn).save({
                        id: bonusTxns[i].id,
                        status: AcceptedStatusOpts.declined,
                    })
                }
                bonusTxns[i]["cashback"] = sum;
            } catch (err) {
                res.status(500).json(err);
            }
        }
    }
    res.status(200).json(bonusTxns);
}

export {
    getBonusTxns,
    postBonusTxn,
    getBonusTxn,
    updateBonusTxn,
    deleteBonusTxn,
    getBonusTxnByUser
};
