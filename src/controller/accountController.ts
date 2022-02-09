import { NextFunction, Response } from "express";
import { getRepository } from "typeorm";
import { PaymentMode } from "../entity/Payment/PaymentMode";
import { PayoutRequest } from "../entity/Payment/PayoutRequest";
import { BonusTxn } from "../entity/Transactions/BonusTxn";
import { CashbackTxn } from "../entity/Transactions/CashbackTxn";
import { ReferrerTxn } from "../entity/Transactions/ReferrerTxn";
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
    rewardAmount: number;
    rewardAmountPending: number;
}> => {
    const cashTxns = await getRepository(CashbackTxn).find({
        where: { user: id },
        relations: ["user", "store", "networkId"],
    });
    let pendingAmount = 0;
    let comfirmedAmount = 0;

    cashTxns.forEach((txn) => {
        if (txn.status === "pending") {
            pendingAmount += txn.cashback;
        }
        if (txn.status === "confirmed") {
            comfirmedAmount += txn.cashback;
        }
    });

    const referrerTxns = await getRepository(ReferrerTxn).find({
        where: { user: id },
        relations: ["user", "store"],
    });
    referrerTxns.forEach((txn) => {
        if (txn.status === "pending") {
            pendingAmount += txn.referrer_amount;
        }
        if (txn.status === "confirmed") {
            comfirmedAmount += txn.referrer_amount;
        }
    });

    // Calculation for rewards
    let rewardAmount = 0;
    let rewardAmountPending = 0;

    const rewardTxns = await getRepository(BonusTxn).find({
        where: { user: id },
        relations: ["user"],
    });

    rewardTxns.forEach((txn) => {
        if (txn.status === "pending") {
            rewardAmountPending += txn.amount;
        }
        if (txn.status === "confirmed") {
            rewardAmount += txn.amount;
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
    let payoutAmtReward = 0;
    payouts.forEach((payout) => {
        payoutAmount += payout.cashback_amount;
        payoutAmtReward += payout.reward_amount;
    });

    const walletAmount = comfirmedAmount - payoutAmount + rewardAmount - payoutAmtReward;

    return {
        pendingAmount,
        comfirmedAmount,
        walletAmount,
        rewardAmount,
        rewardAmountPending,
    };
};

const getAmountStatus = async (req: IGetUserAuthInfoRequest, res: Response) => {
    return res.status(200).json(await calculateWallet(req.user.id));
};

const withdraw = async (req: IGetUserAuthInfoRequest, res: Response) => {
    const paymentModeId = req.body.payment_mode;
    const { walletAmount, rewardAmount } = await calculateWallet(req.user.id);
    // TODO: Calculation for rewards to be done
    var amountToWithdraw = req.body.amount;
    if (amountToWithdraw < 100)
        return res.status(400).json({message: "Minimum Withdraw Amount 100INR"})
    if (amountToWithdraw > walletAmount) {
        return res.status(400).json({ message: "Insufficient funds" });
    }
    var payout = new PayoutRequest();
    payout.user_id = req.user;
    payout.payment_mode = await getRepository(PaymentMode).findOneOrFail({
        where: { id: paymentModeId },
    });
    if (payout.payment_mode.method_code === "paytm") {
        if (amountToWithdraw <= rewardAmount) {
            payout.reward_amount = amountToWithdraw;
            payout.cashback_amount = 0;
        } else {
            payout.reward_amount = rewardAmount;
            payout.cashback_amount = amountToWithdraw - rewardAmount;
        }
    } else {
        payout.cashback_amount = amountToWithdraw;
        payout.reward_amount = 0;
    }
    payout.payment_id = generatePaymentId();

    await getRepository(PayoutRequest).save(payout);
    return res.status(200).json({ message: "Payout request sent" });
};

export { getAllTxns, getAmountStatus, withdraw };
