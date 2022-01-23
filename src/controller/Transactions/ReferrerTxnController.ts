import { NextFunction, Request, Response } from "express";
import { getRepository } from "typeorm";
import { ReferrerTxn } from "../../entity/Transactions/ReferrerTxn";

const getReferrerTxns = async (request: Request, response: Response, next: NextFunction) => {
    var txns = await getRepository(ReferrerTxn).find({ relations: ["store"] });
    response.status(200).json(txns);
}

const postReferrerTxns = async (request: Request, response: Response, next: NextFunction) => {
    var newTxn = request.body;
    await getRepository(ReferrerTxn).save(newTxn);
    response.status(201).json(newTxn);
}

const getReferrerTxn = async (request: Request, response: Response, next: NextFunction) => {
    var txn = await getRepository(ReferrerTxn).findOne(
        request.params.id,
        { relations: ["store"] }
    );
    response.status(200).json(txn);
}

const postReferrerTxn = async (request: Request, response: Response, next: NextFunction) => {
    var txn = await getRepository(ReferrerTxn).findOne(request.params.id);
    txn.store = request.body.store;
    txn.refAmount = request.body.clickId;
    txn.saleAmount = request.body.saleAmount;
    txn.currency = request.body.currency;
    txn.status = request.body.status;
    txn.txnDateTime = request.body.txnDateTime;
    txn.mailSent = request.body.mailSent;
    await getRepository(ReferrerTxn).save(txn);
    response.status(201).json(txn);
}

const deleteReferrerTxn = async (request: Request, response: Response, next: NextFunction) => {
    await getRepository(ReferrerTxn).delete(request.params.id);
    response.status(204).send();
}

export {
    getReferrerTxns,
    postReferrerTxns,
    getReferrerTxn,
    postReferrerTxn,
    deleteReferrerTxn
}