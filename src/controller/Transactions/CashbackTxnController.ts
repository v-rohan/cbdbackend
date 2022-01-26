import { NextFunction, Request, Response } from "express";
import { getRepository } from "typeorm";
import { CashbackTxn } from "../../entity/Transactions/CashbackTxn";


const getCashbackTxns = async (request: Request, response: Response, next: NextFunction) => {
    var txns = await getRepository(CashbackTxn).find({ relations: ["user", "store", "networkId"] });
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
        { relations: ["store", "networkId"] }
    );
    response.status(200).json(txn);
}

const postCashbackTxn = async (request: Request, response: Response, next: NextFunction) => {
    var txn = await getRepository(CashbackTxn).findOne(request.params.id);
    txn = {...txn, ...request.body};
    await getRepository(CashbackTxn).save(txn);
    response.status(201).json(txn);
}

const createorUpdateCashbackTxn = async (data: any) => {
    try {
        var cashnackTxn = new CashbackTxn();
        await getRepository(CashbackTxn).save(cashnackTxn);
    } catch (e) {
        console.log(e);
        throw e
    }
}

const deleteCashbackTxn = async (request: Request, response: Response, next: NextFunction) => {
    await getRepository(CashbackTxn).delete(request.params.id);
    response.status(204).send();
}

export {
    getCashbackTxns,
    postCashbackTxns,
    createorUpdateCashbackTxn,
    getCashbackTxn,
    postCashbackTxn,
    deleteCashbackTxn
}