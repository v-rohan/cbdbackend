import { NextFunction, Response } from "express";
import { getRepository } from "typeorm";
import { CashbackTxn } from "../entity/Transactions/CashbackTxn";
import { IGetUserAuthInfoRequest } from "../types";

const getAllTxns = async (
    request: IGetUserAuthInfoRequest,
    response: Response,
    next: NextFunction
) => {
    const txns = await getRepository(CashbackTxn).find({
        where: { user: request.user.id },
        relations: ["user", "store", "networkId"],
    });
    return response.status(200).json(txns);
};

export {
    getAllTxns,
};
