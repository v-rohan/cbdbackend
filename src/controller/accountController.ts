import { NextFunction, Response } from "express";
import { getRepository } from "typeorm";
import { PaymentMode } from "../entity/Payment/PaymentMode";
import { PayoutRequest } from "../entity/Payment/PayoutRequest";
import { Clicks } from "../entity/Clicks";
import { CashbackType } from "../entity/Store";
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
        relations: ["store"],
    });
    let pendingAmount = 0;
    let comfirmedAmount = 0;
    
    let rewardAmount = 0;
    let rewardAmountPending = 0;

    cashTxns.forEach((txn) => {
        if (txn.store.cashback_type === CashbackType.CASHBACK) {
            if (txn.status === "pending") {
                pendingAmount += txn.cashback;
            }
            else if (txn.status === "confirmed") {
                comfirmedAmount += txn.cashback;
            }
        } else {
            if (txn.status === "pending") {
                rewardAmountPending += txn.cashback;
            }
            else if (txn.status === "confirmed") {
                rewardAmount += txn.cashback;
            }
        }
    });

    // Calculation for rewards
    const referrerTxns = await getRepository(ReferrerTxn).find({
        where: { user: id },
        relations: ["user", "store"],
    });
    const bonusTxns = await getRepository(BonusTxn).find({
        where: { user: id },
        relations: ["user"],
    });

    referrerTxns.forEach((txn) => {
        if (txn.status === "pending") {
            rewardAmountPending += txn.referrer_amount;
        }
        if (txn.status === "confirmed") {
            rewardAmount += txn.referrer_amount;
        }
    });

    bonusTxns.forEach((txn) => {
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
        relations: ["user_id"],
    });

    // Amount Already Paid to user
    let payoutAmount = 0;
    let payoutAmtReward = 0;
    payouts.forEach((payout) => {
        payoutAmount += payout.cashback_amount;
        payoutAmtReward += payout.reward_amount;
    });

    const walletAmount = comfirmedAmount - payoutAmount + rewardAmount - payoutAmtReward;

    return {
        walletAmount,
        pendingAmount,
        comfirmedAmount,
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

const getClicksByUserByMonth = async (req : IGetUserAuthInfoRequest, res : Response) => {
    const clicks = await getRepository(Clicks).find({
        where: { user: req.user.id },
        relations: ["store"],
        order: { createdAt: 'DESC' }
    })
    const monthlyClicks = Object.values(clicks.reduce((r, element) => {
        let dateObj = new Date(element.createdAt);
        let monthyear = dateObj.toLocaleString("en-us", {month: "long"}).substring(0, 3).toUpperCase() + " " + dateObj.getFullYear();
        if (!r[monthyear]) {
            r[monthyear] = { monthyear, clicks: [element] }
        } else {
            r[monthyear].clicks.push(element);
        }
        return r;
    }, {}))
    return res.status(200).json(monthlyClicks);
}

const getCashbackTxnsByUserByMonth = async (req: IGetUserAuthInfoRequest, res: Response) => {
    const cashback = await getRepository(CashbackTxn).find({
        where: { user: req.user.id, store: { cashback_type: CashbackType.CASHBACK } },
        relations: [ "network_id", "store" ],
        order: { created_at: "DESC" }
    })
    const monthlyCashbacks = Object.values(cashback.reduce((r, element) => {
        let dateObj = new Date(element.created_at);
        let monthyear = dateObj.toLocaleString("en-us", {month: "long"}).substring(0, 3).toUpperCase() + " " + dateObj.getFullYear();
        if (!r[monthyear]) {
            r[monthyear] = { monthyear, clicks: [element] }
        } else {
            r[monthyear].clicks.push(element);
        }
        return r;
    }, {}))
    return res.status(200).json(monthlyCashbacks);
}

const getRewardTxnByUserByMonth = async (req: IGetUserAuthInfoRequest, res: Response) => {
    const bonus = await getRepository(BonusTxn).find({
        where: { user: req.user.id },
        order: { awarded_on: "DESC" }
    })
    const referrerTxns = await getRepository(ReferrerTxn).find({
        where: { user: req.user.id },
        order: { created_at: "DESC" }
    })
    const cashbackTxns = await getRepository(CashbackTxn).find({
        where: { user: req.user.id, store: { cashback_type: CashbackType.REWARD } },
        order: { created_at: "DESC" }
    })
    const monthlyBonus = (bonus.reduce((r, element) => {
        let dateObj = new Date(element.awarded_on);
        element["created_at"] = element.awarded_on;
        let monthyear = dateObj.toLocaleString("en-us", {month: "long"}).substring(0, 3).toUpperCase() + " " + dateObj.getFullYear();
        if (!r[monthyear]) {
            r[monthyear] = { monthyear, txns: [element] }
        } else {
            r[monthyear].clicks.push(element);
        }
        return r;
    }, {}))
    const txnReducer = (r, element) => {
        let dateObj = new Date(element.created_at);
        let monthyear = dateObj.toLocaleString("en-us", {month: "long"}).substring(0, 3).toUpperCase() + " " + dateObj.getFullYear();
        if (!r[monthyear]) {
            r[monthyear] = { monthyear, txns: [element] }
        } else {
            r[monthyear].clicks.push(element);
        }
        return r;
    }
    const monthlyCashbacks = cashbackTxns.reduce(txnReducer, {})
    const monthlyRefers = referrerTxns.reduce(txnReducer, {})

    var monthlyRewards = monthlyBonus;

    monthlyCashbacks.keys().forEach((key) => {
        if(monthlyRewards.hasOwnProperty(key)) {
            monthlyRewards[key].txns.concat(monthlyCashbacks[key].txns)
        } else {
            monthlyRewards[key] = monthlyCashbacks[key]
        }
    })

    monthlyRefers.keys().forEach((key) => {
        if (monthlyRewards.hasOwnProperty(key)) {
            monthlyRewards[key].txns.concat(monthlyRefers[key].txns)
        } else {
            monthlyRewards[key] = monthlyRefers[key]
        }
    })

    monthlyRewards = Object.values(monthlyRewards);
    
    return res.status(200).json(monthlyRewards);
}

export {
    getAllTxns,
    getAmountStatus,
    withdraw,
    getClicksByUserByMonth,
    getCashbackTxnsByUserByMonth,
    getRewardTxnByUserByMonth
 };
