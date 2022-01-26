import { NextFunction, Request, Response } from "express";
import { getRepository } from "typeorm";
import { SalesTxn } from "../../entity/Transactions/SalesTxn";

const getSalesTxns = async (request: Request, response: Response, next: NextFunction) => {
    var txns = await getRepository(SalesTxn).find({ relations: ["network"] });
    response.status(200).json(txns);
}

const postSalesTxns = async (request: Request, response: Response, next: NextFunction) => {
    var newTxn = request.body;
    await getRepository(SalesTxn).save(newTxn);
    response.status(201).json(newTxn);
}

const getSalesTxn = async (request: Request, response: Response, next: NextFunction) => {
    var txn = await getRepository(SalesTxn).findOne(
        request.params.id,
        { relations: ["network"] }
    );
    response.status(200).json(txn);
}

const postSalesTxn = async (request: Request, response: Response, next: NextFunction) => {
    var txn = await getRepository(SalesTxn).findOne(request.params.id);
    txn = {...txn, ...request.body};
    await getRepository(SalesTxn).save(txn);
    response.status(201).json(txn);
}

const createorUpdateSalesTxn = async (data: any) => {
    try {
        var salesTxn = new SalesTxn();
        await getRepository(SalesTxn).save(salesTxn);
    } catch (e) {
        console.log(e);
        throw e
    }
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
    createorUpdateSalesTxn
}