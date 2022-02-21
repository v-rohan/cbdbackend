import { NextFunction, Request, Response } from "express";
import { getRepository } from "typeorm";
import { SalesTxn } from "../../entity/Transactions/SalesTxn";

const getSalesTxns = async (req: Request, res: Response, next: NextFunction) => {
    var txns = await getRepository(SalesTxn).find({ relations: ["network_id"] });
    res.set({
        "Access-Control-Expose-Headers": "Content-Range",
        "Content-Range": `X-Total-Count: ${1} - ${txns.length} / ${
            txns.length
        }`,
    })
    res.status(200).json(txns);
}

const postSalesTxns = async (req: Request, res: Response, next: NextFunction) => {
    var newTxn = req.body;
    await getRepository(SalesTxn).save(newTxn);
    res.status(201).json(newTxn);
}

const getSalesTxn = async (req: Request, res: Response, next: NextFunction) => {
    var txn = await getRepository(SalesTxn).findOne(
        req.params.id,
        { relations: ["network_id"] }
    );
    res.status(200).json(txn);
}

const postSalesTxn = async (req: Request, res: Response, next: NextFunction) => {
    var txn = await getRepository(SalesTxn).findOne(req.params.id);
    txn = {...txn, ...req.body};
    await getRepository(SalesTxn).save(txn);
    res.status(201).json(txn);
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

const deleteSalesTxn = async (req: Request, res: Response, next: NextFunction) => {
    await getRepository(SalesTxn).delete(req.params.id);
    res.status(204).send();
}

export {
    getSalesTxns,
    postSalesTxns,
    getSalesTxn,
    postSalesTxn,
    deleteSalesTxn,
    createorUpdateSalesTxn
}