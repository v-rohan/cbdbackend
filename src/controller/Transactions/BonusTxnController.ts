import { NextFunction, Request, Response } from "express";
import { getRepository } from "typeorm";
import { BonusTxn } from "../../entity/Transactions/BonusTxn";


const getBonusTxns = async (request: Request, response: Response, next: NextFunction) => {
    var txns = await getRepository(BonusTxn).find();
    response.status(200).json(txns);
}

const postBonusTxns = async (request: Request, response: Response, next: NextFunction) => {
    var newTxn = request.body;
    await getRepository(BonusTxn).save(newTxn);
    response.status(201).json(newTxn);
}

const getBonusTxn = async (request: Request, response: Response, next: NextFunction) => {
    var txn = await getRepository(BonusTxn).findOne(request.params.id);
    response.status(200).json(txn);
}

const postBonusTxn = async (request: Request, response: Response, next: NextFunction) => {
    var txn = await getRepository(BonusTxn).findOne(request.params.id);
    txn.bonus_code = request.body.bonusCode;
    txn.amount = request.body.amount;
    txn.awarded_on = request.body.awardedOn;
    txn.expires_on = request.body.expiresOn;
    txn.status = request.body.status;
    await getRepository(BonusTxn).save(txn);
    response.status(201).json(txn);
}

const deleteBonusTxn = async (request: Request, response: Response, next: NextFunction) => {
    await getRepository(BonusTxn).delete(request.params.id);
    response.status(204).send();
}

export {
    getBonusTxns,
    postBonusTxns,
    getBonusTxn,
    postBonusTxn,
    deleteBonusTxn
}