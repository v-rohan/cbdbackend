import { NextFunction, response, Response } from "express";
import { getRepository } from "typeorm";
import { PayoutRequest } from "../entity/Payment/PayoutRequest";
import { CashbackTxn } from "../entity/Transactions/CashbackTxn";
import { IGetUserAuthInfoRequest } from "../types";

const getAllTxns = async (
    req: IGetUserAuthInfoRequest,
    res: Response,
    next: NextFunction
) => {
    const txns = await getRepository(CashbackTxn).find({
        where: { user: req.user.id },
        relations: ["user", "store", "networkId"],
    });
    return res.status(200).json(txns);
};

const calculateWallet = async (
    id: number
): Promise<{
    pendingAmount: number;
    comfirmedAmount: number;
    walletAmount: number;
}> => {
    const txns = await getRepository(CashbackTxn).find({
        where: { user: id },
        relations: ["user", "store", "networkId"],
    });
    let pendingAmount = 0;
    let comfirmedAmount = 0;

    // TODO Calculation for rewards to be done
    txns.forEach((txn) => {
        if (txn.status === "pending") {
            pendingAmount += txn.cashback;
        }
        if (txn.status === "confirmed") {
            comfirmedAmount += txn.cashback;
        }
    });

    const payouts = await getRepository(PayoutRequest).find({
        where: {
            user_id: id,
            status: "completed",
        },
        relations: ["user"],
    });

    let payoutAmount = 0;
    payouts.forEach((payout) => {
        payoutAmount += payout.reward_amount + payout.cashback_amount;
    });

    const walletAmount = comfirmedAmount - payoutAmount;

    return { pendingAmount, comfirmedAmount, walletAmount };
};

const getAmountStatus = async (req: IGetUserAuthInfoRequest, res: Response) => {
    return res.status(200).json(await calculateWallet(req.user.id));
};

// const withdraw = async (req: IGetUserAuthInfoRequest, res: Response) => {
//     var paymentModeId = req.body.payment_mode;
//     const { walletAmount } = await calculateWallet(req.user.id);
//     var amountToWithdraw = req.body.amount;
//     if (amountToWithdraw > walletAmount) {
//         return res.status(400).json({
//             message: "Insufficient funds",
//         });
//     }
//     var payoutRequest = new PayoutRequest();
//     payoutRequest.user_id = req.user;
// };

export { getAllTxns, getAmountStatus };
