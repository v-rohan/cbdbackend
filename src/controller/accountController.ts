import { NextFunction, Response } from "express";
import { Between, getRepository } from "typeorm";
import { PaymentMode } from "../entity/Payment/PaymentMode";
import { PayoutRequest } from "../entity/Payment/PayoutRequest";
import { Clicks } from "../entity/Clicks";
import { CashbackType } from "../entity/Store";
import { BonusTxn } from "../entity/Transactions/BonusTxn";
import { CashbackTxn } from "../entity/Transactions/CashbackTxn";
import { ReferrerTxn } from "../entity/Transactions/ReferrerTxn";
import { IGetUserAuthInfoRequest } from "../types";
import { User } from "../entity/User";
import { AcceptedStatusOpts } from "../entity/Transactions/Common";
import { BankImage } from "../entity/BankImages";
import e = require("express");

const charSet: string =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    const txnReducer = (r, element) => {
    let dateObj = new Date(element.created_at);
    let monthyear =
        dateObj
            .toLocaleString("en-us", { month: "long" })
            .substring(0, 3)
            .toUpperCase() +
        " " +
        dateObj.getFullYear();
    if (!r[monthyear]) {
        r[monthyear] = {
            monthyear,
            txns: [element],
        };
    } else {
        r[monthyear].txns.push(element);
    }
    return r;
};

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
        where: {
            user: req.user,
        },
        relations: ["user", "store", "networkId"],
    });
    return res.status(200).json(txns);
};

const calculateWallet = async (
    id: User
): Promise<{
    pendingAmount: number;
    comfirmedAmount: number;
    walletAmount: number;
    rewardAmount: number;
    rewardAmountPending: number;
}> => {
    const cashTxns = await getRepository(CashbackTxn).find({
        where: {
            user: id,
        },
        relations: ["store"],
    });
    let pendingAmount = 0;
    let comfirmedAmount = 0;

    let rewardAmount = 0;
    let rewardAmountPending = 0;

    cashTxns.forEach((txn) => {
        if (txn.store.cashback_type === CashbackType.CASHBACK) {
            if (txn.status === "pending") {
                pendingAmount += Number(txn.cashback);
            } else if (txn.status === "confirmed") {
                comfirmedAmount += Number(txn.cashback);
            }
        } else {
            if (txn.status === "pending") {
                rewardAmountPending += Number(txn.cashback);
            } else if (txn.status === "confirmed") {
                rewardAmount += Number(txn.cashback);
            }
        }
    });

    // Calculation for rewards
    const referrerTxns = await getRepository(ReferrerTxn).find({
        where: {
            user: id,
        },
        relations: ["user", "store"],
    });
    const bonusTxns = await getRepository(BonusTxn).find({
        where: {
            user: id,
        },
        relations: ["user"],
    });

    referrerTxns.forEach((txn) => {
        if (txn.status === "pending") {
            rewardAmountPending += Number(txn.referrer_amount);
        }
        if (txn.status === "confirmed") {
            rewardAmount += Number(txn.referrer_amount);
        }
    });

    bonusTxns.forEach((txn) => {
        if (txn.status === "pending") {
            rewardAmountPending += Number(txn.amount);
        }
        if (txn.status === "confirmed") {
            rewardAmount += Number(txn.amount);
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
        payoutAmount += Number(payout.cashback_amount);
        payoutAmtReward += Number(payout.reward_amount);
    });

    const walletAmount =
        comfirmedAmount - payoutAmount + rewardAmount - payoutAmtReward;

    return {
        walletAmount,
        pendingAmount,
        comfirmedAmount,
        rewardAmount,
        rewardAmountPending,
    };
};

const getAmountStatus = async (req: IGetUserAuthInfoRequest, res: Response) => {
    return res.status(200).json(await calculateWallet(req.user));
};

const withdraw = async (req: IGetUserAuthInfoRequest, res: Response) => {
    const paymentModeId = Number(req.body.payment_mode);
    var { walletAmount, rewardAmount } = await calculateWallet(req.user);
    walletAmount = Number(walletAmount);
    rewardAmount = Number(rewardAmount)

    var amountToWithdraw = Number(req.body.amount);
    if (amountToWithdraw < 100)
        return res
            .status(400)
            .json({ message: "Minimum withdrawal amount is 100INR" });

    if (amountToWithdraw > walletAmount) {
        return res.status(400).json({ message: "Insufficient funds to complete the transaction" });
    }
    var payout = new PayoutRequest();
    payout.user_id = req.user;
    payout.payment_mode = await getRepository(PaymentMode).findOneOrFail({
        where: {
            id: paymentModeId,
        },
    });
    if (payout.payment_mode.method_code === "paytm") {
        if (amountToWithdraw <= rewardAmount) {
            payout.reward_amount = Number(amountToWithdraw);
            payout.cashback_amount = Number(0);
        } else {
            payout.reward_amount = Number(rewardAmount);
            payout.cashback_amount = Number(amountToWithdraw) - Number(rewardAmount);
        }
    } else {
        payout.cashback_amount = Number(amountToWithdraw);
        payout.reward_amount = Number(0);
    }
    payout.payment_id = generatePaymentId();

    await getRepository(PayoutRequest).save(payout);
    return res.status(200).json({ message: "Payout request sent" });
};

const getClicksByUserByMonth = async (
    req: IGetUserAuthInfoRequest,
    res: Response
) => {
    const clicks = await getRepository(Clicks).find({
        where: {
            user: req.user,
        },
        relations: ["store"],
        order: {
            createdAt: "DESC",
        },
    });
    const monthlyClicks = Object.values(
        clicks.reduce((r, element) => {
            let dateObj = new Date(element.createdAt);
            let monthyear =
                dateObj
                    .toLocaleString("en-us", { month: "long" })
                    .substring(0, 3)
                    .toUpperCase() +
                " " +
                dateObj.getFullYear();
            if (!r[monthyear]) {
                r[monthyear] = {
                    monthyear,
                    clicks: [element],
                };
            } else {
                r[monthyear].clicks.push(element);
            }
            return r;
        }, {})
    );
    return res.status(200).json(monthlyClicks);
};

const getCashbackTxnsByUserByMonth = async (
    req: IGetUserAuthInfoRequest,
    res: Response
) => {
    const cashback = await getRepository(CashbackTxn).find({
        where: {
            user: req.user,
            store: {
                cashback_type: CashbackType.CASHBACK,
            },
        },
        relations: ["network_id", "store"],
        order: {
            created_at: "DESC",
        },
    });
    const monthlyCashbacks = Object.values(
        cashback.reduce((r, element) => {
            let dateObj = new Date(element.created_at);
            let monthyear =
                dateObj
                    .toLocaleString("en-us", { month: "long" })
                    .substring(0, 3)
                    .toUpperCase() +
                " " +
                dateObj.getFullYear();
            if (!r[monthyear]) {
                r[monthyear] = {
                    monthyear,
                    txns: [element],
                };
            } else {
                r[monthyear].txns.push(element);
            }
            return r;
        }, {})
    );
    return res.status(200).json(monthlyCashbacks);
};

const evaluateBonusTxns = async (user: User) => {
    const bonusTxns = await getRepository(BonusTxn).find({
        where: {
            user: user,
        },
        relations: ["user"],
        order: {
            awarded_on: "ASC",
        },
    });

    for(let i = 0; i < bonusTxns.length; i++) {
        if (bonusTxns[i].status === AcceptedStatusOpts.pending) {
            if (bonusTxns[i].bonus_code === "refer_bonus") {
                const referredCashbackTxns = await getRepository(
                    CashbackTxn
                ).find({
                    where: {
                        user: bonusTxns[i].referred,
                        store: {
                            cashback_type: CashbackType.CASHBACK,
                        },
                        created_at: Between(
                            bonusTxns[i].awarded_on,
                            bonusTxns[i].expires_on
                        ),
                    },
                    relations: ["store"],
                });
                var sum = 0;
                referredCashbackTxns.forEach((txn) => {
                    sum += txn.cashback;
                });
                if (sum >= 500) {
                    bonusTxns[i].status = AcceptedStatusOpts.confirmed;
                    bonusTxns[i]["earned"] = 500;
                } else if (bonusTxns[i].expires_on >= new Date()) {
                    bonusTxns[i]["earned"] = sum;
                } else if (bonusTxns[i].expires_on < new Date()) {
                    bonusTxns[i].status = AcceptedStatusOpts.declined;
                }
            } else {
                const cashbacks = await getRepository(CashbackTxn).find({
                    where: {
                        user: user,
                        store: { cashback_type: CashbackType.CASHBACK },
                        status: AcceptedStatusOpts.confirmed,
                        created_at: Between(
                            bonusTxns[i].awarded_on,
                            bonusTxns[i].expires_on
                        ),
                    },
                    relations: ["store"],
                });
                var sum = 0;
                cashbacks.forEach(async (txn) => {
                    sum += txn.cashback;
                });

                if (sum >= bonusTxns[i].amount) {
                    bonusTxns[i].status = AcceptedStatusOpts.confirmed;
                    bonusTxns[i]["earned"] = 500;
                    await getRepository(BonusTxn).save({ id: bonusTxns[i].id });
                } else if (bonusTxns[i].expires_on > new Date()) {
                    bonusTxns[i]["earned"] = sum;
                } else {
                    bonusTxns[i].status = AcceptedStatusOpts.declined;
                }
            }
        }
    }
    return bonusTxns;
};

const getBonusTxnByUser = async (
    req: IGetUserAuthInfoRequest,
    res: Response
) => {
    const bonusTxns = await evaluateBonusTxns(req.user);
    return res.status(200).json(bonusTxns);
};

const getRewardTxnByUserByMonth = async (
    req: IGetUserAuthInfoRequest,
    res: Response
) => {
    const bonus = await evaluateBonusTxns(req.user);
    const referrerTxns = await getRepository(ReferrerTxn).find({
        where: {
            user: req.user,
        },
        order: {
            created_at: "DESC",
        },
    });
    const cashbackTxns = await getRepository(CashbackTxn).find({
        where: {
            user: req.user,
            store: { cashback_type: CashbackType.REWARD },
        },
        relations: ["store"],
        order: { created_at: "DESC" },
    });

    const monthlyBonus = bonus.reduce((r, element) => {
        let dateObj = new Date(element.awarded_on);
        element["created_at"] = element.awarded_on;
        let monthyear =
            dateObj
                .toLocaleString("en-us", { month: "long" })
                .substring(0, 3)
                .toUpperCase() +
            " " +
            dateObj.getFullYear();
        if (!r[monthyear]) {
            r[monthyear] = {
                monthyear,
                txns: [element],
            };
        } else {
            r[monthyear].txns.push(element);
        }
        return r;
    }, {});
    
    const monthlyCashbacks = cashbackTxns.reduce(txnReducer, {});
    const monthlyRefers = referrerTxns.reduce(txnReducer, {});
    var monthlyRewards = monthlyBonus;

    Object.keys(monthlyCashbacks).forEach((key) => {
        if (monthlyRewards.hasOwnProperty(key)) {
            monthlyRewards[key].txns.concat(monthlyCashbacks[key].txns);
        } else {
            monthlyRewards[key] = monthlyCashbacks[key];
        }
    });

    Object.keys(monthlyRefers).forEach((key) => {
        if (monthlyRewards.hasOwnProperty(key)) {
            monthlyRewards[key].txns.concat(monthlyRefers[key].txns);
        } else {
            monthlyRewards[key] = monthlyRefers[key];
        }
    });

    monthlyRewards = Object.values(monthlyRewards);
    return res.status(200).json(monthlyRewards);
};

const claimBonus = async (req: IGetUserAuthInfoRequest, res: Response) => {
    const bonus = await getRepository(BonusTxn).findOneOrFail({
        where: {
            user: req.user,
            claimed: false,
            id: req.params.id,
        },
        relations: ["store"],
    });
    if (!bonus.claimed) {
        await getRepository(BonusTxn).save({ id: bonus.id, claimed: true });
    }
};

const payoutsByUserByMonth = async (req: IGetUserAuthInfoRequest, res: Response) => {
    const payouts = await getRepository(PayoutRequest).find({
        where: {user_id: req.user},
        order: {created_at: 'DESC'},
        relations: ["payment_mode"]
    })
    for (var i = 0; i < payouts.length; i++) {
        var bankImg;
        if (payouts[i].payment_mode.method_code === "bank") {
            try {
                bankImg = await getRepository(BankImage).findOneOrFail({
                    where: {ifsc_prefix: payouts[i].payment_mode.inputs["ifsc_code"].substring(0,4)}
                })
            } catch (err) {}
        } else {
            bankImg = await getRepository(BankImage).findOneOrFail({
                where: {ifsc_prefix: "PYTM"}
            })
        }
        if (bankImg) {
            payouts[i]["image"] = bankImg.image;
        }
    }
    const monthlyPayouts = Object.values(payouts.reduce(txnReducer, {}))
    return res.status(200).json(monthlyPayouts);
}

export {
    getAllTxns,
    getAmountStatus,
    withdraw,
    getClicksByUserByMonth,
    getCashbackTxnsByUserByMonth,
    getRewardTxnByUserByMonth,
    claimBonus,
    getBonusTxnByUser,
    payoutsByUserByMonth
};
