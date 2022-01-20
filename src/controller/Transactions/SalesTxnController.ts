import { NextFunction, Request, Response } from "express";
import { getRepository } from "typeorm";
import { SalesTxn } from "../../entity/Transactions/SalesTxn";

const getSalesTxns = async (request: Request, response: Response, next: NextFunction) => {
    var txns = await getRepository(SalesTxn).find();
    response.status(200).json(txns);
}

const postSalesTxns = async (request: Request, response: Response, next: NextFunction) => {
    var newTxn = request.body;
    await getRepository(SalesTxn).save(newTxn);
    response.status(201).json(newTxn);
}

const getSalesTxn = async (request: Request, response: Response, next: NextFunction) => {
    var txn = await getRepository(SalesTxn).findOne(request.params.id);
    response.status(200).json(txn);
}

const postSalesTxn = async (request: Request, response: Response, next: NextFunction) => {
    var txn = await getRepository(SalesTxn).findOne(request.params.id);
    txn.networkId = request.body.networkId;
    txn.networkCampId = request.body.networkCampId;
    txn.txnId = request.body.txnId;
    txn.commissionId = request.body.commissionId;
    txn.orderId = request.body.orderId;
    txn.clickDate = request.body.clickDate;
    txn.saleDate = request.body.saleDate;
    txn.saleAmount = request.body.saleAmount;
    txn.baseCommission = request.body.baseCommission;
    txn.saleUpdTime = request.body.saleUpdTime;
    txn.currency = request.body.currency;
    txn.status = request.body.status;
    txn.affSub1 = request.body.affSub1;
    txn.affSub2 = request.body.affSub2;
    txn.affSub3 = request.body.affSub3;
    txn.affSub4 = request.body.affSub4;
    txn.affSub5 = request.body.affSub5;
    txn.batchId = request.body.batchId;
    txn.exInfo = request.body.exInfo;
    await getRepository(SalesTxn).save(txn);
    response.status(201).json(txn);
}

const deleteSalesTxn = async (request: Request, response: Response, next: NextFunction) => {
    await getRepository(SalesTxn).delete(request.params.id);
    response.status(204).send();
}

export {
    getSalesTxns,
    postSalesTxns,
    getSalesTxn,
    postSalesTxn,
    deleteSalesTxn,
}