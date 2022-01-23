import { NextFunction, Request, Response } from "express";
import { getRepository } from "typeorm";
import { CashbackTxn } from "../../entity/Transactions/CashbackTxn";


const getCashbackTxns = async (request: Request, response: Response, next: NextFunction) => {
    var txns = await getRepository(CashbackTxn).find({ relations : ["user", "store", "networkId"] });
    response.status(200).json(txns);
}

const postCashbackTxns = async (request: Request, response: Response, next: NextFunction) => {
    var newTxn = request.body;
    await getRepository(CashbackTxn).save(newTxn);
    response.status(201).json(newTxn);
}

const getCashbackTxn = async (request: Request, response: Response, next: NextFunction) => {
    var txn = await getRepository(CashbackTxn).findOne(
        request.params.id,
        { relations : ["store", "networkId"] }
    );
    response.status(200).json(txn);
}

const postCashbackTxn = async (request: Request, response: Response, next: NextFunction) => {
    var txn = await getRepository(CashbackTxn).findOne(request.params.id);
    txn.saleId = request.body.saleId;
    txn.networkId = request.body.networkId;
    txn.orderId = request.body.orderId;
    txn.store = request.body.store;
    txn.clickId = request.body.clickId;
    txn.saleAmount = request.body.saleAmount;
    txn.cashback = request.body.cashback;
    txn.currency = request.body.currency;
    txn.status = request.body.status;
    txn.txnDateTime = request.body.txnDateTime;
    txn.mailSent = request.body.mailSent;
    await getRepository(CashbackTxn).save(txn);
    response.status(201).json(txn);
}

const deleteCashbackTxn = async (request: Request, response: Response, next: NextFunction) => {
    await getRepository(CashbackTxn).delete(request.params.id);
    response.status(204).send();
}

export {
    getCashbackTxns,
    postCashbackTxns,
    getCashbackTxn,
    postCashbackTxn,
    deleteCashbackTxn
}