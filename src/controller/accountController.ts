import { NextFunction, Response } from "express";
import { getRepository } from "typeorm";
import { PaymentMode } from "../entity/Payment/PaymentMode";
import { PayoutRequest } from "../entity/Payment/PayoutRequest";
import { CashbackTxn } from "../entity/Transactions/CashbackTxn";
import { IGetUserAuthInfoRequest } from "../types";

const charSet: string =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

const generatePaymentId = () => {
    let randomString: string = "";
    for (let i: number = 0; i < 10; i++) {
        randomString += charSet.charAt(
            Math.floor(Math.random() * charSet.length)
        );
    }
    randomString += new Date().getTime().toString(36);
    return randomString;
};

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

    // TODO: Calculation for rewards to be done
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

    let payoutAmount = 0; // Amount Already Paid to user
    payouts.forEach((payout) => {
        payoutAmount += payout.cashback_amount;
    });

    const walletAmount = comfirmedAmount - payoutAmount;

    return { pendingAmount, comfirmedAmount, walletAmount };
};

const getAmountStatus = async (req: IGetUserAuthInfoRequest, res: Response) => {
    return res.status(200).json(await calculateWallet(req.user.id));
};

const withdraw = async (req: IGetUserAuthInfoRequest, res: Response) => {
    const paymentModeId = req.body.payment_mode;
    const { walletAmount } = await calculateWallet(req.user.id);
    // TODO: Calculation for rewards to be done
    var amountToWithdraw = req.body.amount;
    if (amountToWithdraw > walletAmount) {
        return res.status(400).json({ message: "Insufficient funds" });
    }
    var payout = new PayoutRequest();
    payout.user_id = req.user;
    payout.payment_mode = await getRepository(PaymentMode).findOneOrFail({
        where: { id: paymentModeId },
    });
    payout.cashback_amount = amountToWithdraw;
    payout.payment_id = generatePaymentId();

    await getRepository(PayoutRequest).save(payout);
    return res.status(200).json({ message: "Payout request sent" });
};

export { getAllTxns, getAmountStatus, withdraw };
