import { getManager, getRepository } from "typeorm";
import { NextFunction, Request, Response, Express } from "express";
import { IGetUserAuthInfoRequest } from "../types";
import { AdminCheck } from "../middleware/AuthMiddleware";
import multer = require("multer");

import { Store } from "../entity/Store";
import { AffiliateNetwork } from "../entity/AffiliateNetwork";
import { CashbackTxn } from "../entity/Transactions/CashbackTxn";
import { User } from "../entity/User";
import { SalesTxn } from "../entity/Transactions/SalesTxn";
import { AcceptedStatusOpts, StatusOpts } from "../entity/Transactions/Common";
import { ReferrerTxn } from "../entity/Transactions/ReferrerTxn";
import { BonusTxn } from "../entity/Transactions/BonusTxn";

module.exports = (app: Express, passport) => {
    require("../passport/jwt")(passport);
    require("../passport/google")(passport);

    app.get(
        "/earning/store",
        passport.authenticate(["jwt"]),
        async (req: IGetUserAuthInfoRequest, res: Response) => {
            try {
                getRepository(Store)
                    .find({ relations: ["salesTxns"] })
                    .then((stores) => {
                        var a: any = stores;
                        a.forEach((store) => {
                            store.sales = 0;
                            store.commission = 0;
                            store.salesTxns.forEach((salesTxn) => {
                                if (salesTxn.status === StatusOpts.confirmed) {
                                    store.sales += salesTxn.sale_amount;
                                    store.commission +=
                                        salesTxn.commission_amount;
                                }
                            });
                        });
                        res.set({
                            "Access-Control-Expose-Headers": "Content-Range",
                            "Content-Range": `X-Total-Count: ${1} - ${
                                a.length
                            } / ${a.length}`,
                        });
                        res.status(200).send(a);
                    });
            } catch (e) {
                res.status(500).send(e);
            }
        }
    );

    app.get(
        "/earning/network",
        passport.authenticate(["jwt"]),
        async (req: IGetUserAuthInfoRequest, res: Response) => {
            try {
                getRepository(AffiliateNetwork)
                    .find({ relations: ["salesTxns"] })
                    .then((networks) => {
                        var a: any = networks;
                        a.forEach((network) => {
                            network.sales = 0;
                            network.commission = 0;
                            network.salesTxns.forEach((salesTxn) => {
                                if (salesTxn.status === StatusOpts.confirmed) {
                                    network.sales += salesTxn.sale_amount;
                                    network.commission +=
                                        salesTxn.commission_amount;
                                }
                            });
                        });
                        res.set({
                            "Access-Control-Expose-Headers": "Content-Range",
                            "Content-Range": `X-Total-Count: ${1} - ${
                                a.length
                            } / ${a.length}`,
                        });
                        res.status(200).send(a);
                    });
            } catch (e) {
                res.status(500).send(e);
            }
        }
    );

    app.get(
        "/earning/user",
        passport.authenticate(["jwt"]),
        async (req: IGetUserAuthInfoRequest, res: Response) => {
            try {
                var users: any = await getRepository(User).find({
                    order: {
                        id: "ASC",
                    },
                });
                users.forEach(async (user: any) => {
                    user.earning = 0;
                    var cashbackTxns = await getRepository(CashbackTxn).find({
                        where: { user: user },
                    });
                    cashbackTxns.forEach((cashbackTxn: CashbackTxn) => {
                        if (cashbackTxn.status === AcceptedStatusOpts.confirmed)
                            user.earning += cashbackTxn.cashback;
                    });
                });
                res.set({
                    "Access-Control-Expose-Headers": "Content-Range",
                    "Content-Range": `X-Total-Count: ${1} - ${users.length} / ${
                        users.length
                    }`,
                });
                res.status(200).send(users);
            } catch (e) {
                res.status(500).send(e);
            }
        }
    );

    app.get(
        "/earning/profitreport",
        passport.authenticate(["jwt"]),
        async (req: IGetUserAuthInfoRequest, res: Response) => {
            try {
                var sales = await getRepository(SalesTxn).find();
                var cashbacks = await getRepository(CashbackTxn).find();
                var referrals = await getRepository(ReferrerTxn).find();
                var bonuses = await getRepository(BonusTxn).find();

                var data = {
                    sales: {
                        pending: 0,
                        confirmed: 0,
                        delayed: 0,
                        declined: 0,
                        total: 0,
                    },
                    commission: {
                        pending: 0,
                        confirmed: 0,
                        delayed: 0,
                        declined: 0,
                        total: 0,
                    },
                    cashback: {
                        pending: 0,
                        confirmed: 0,
                        delayed: 0,
                        declined: 0,
                        total: 0,
                    },
                    referral: {
                        pending: 0,
                        confirmed: 0,
                        delayed: 0,
                        declined: 0,
                        total: 0,
                    },
                    bonus: {
                        pending: 0,
                        confirmed: 0,
                        delayed: 0,
                        declined: 0,
                        total: 0,
                    },
                    profit: {
                        pending: 0,
                        confirmed: 0,
                        delayed: 0,
                        declined: 0,
                        total: 0,
                    },
                    paid: {
                        pending: 0,
                        confirmed: 0,
                        delayed: 0,
                        declined: 0,
                        total: 0,
                    },
                };

                var arr = [];

                sales.forEach((sale: SalesTxn) => {
                    if (sale.status === StatusOpts.confirmed) {
                        data.sales.confirmed += sale.sale_amount;
                        data.commission.confirmed += sale.commission_amount;
                    }
                    if (sale.status === StatusOpts.declined) {
                        data.sales.declined += sale.sale_amount;
                        data.commission.declined += sale.commission_amount;
                    }
                    if (sale.status === StatusOpts.delayed) {
                        data.sales.delayed += sale.sale_amount;
                        data.commission.delayed += sale.commission_amount;
                    }
                    if (sale.status === StatusOpts.pending) {
                        data.sales.pending += sale.sale_amount;
                        data.commission.pending += sale.commission_amount;
                    }
                });

                cashbacks.forEach((cashback: CashbackTxn) => {
                    if (cashback.status === AcceptedStatusOpts.confirmed) {
                        data.cashback.confirmed += cashback.cashback;
                    }
                    if (cashback.status === AcceptedStatusOpts.declined) {
                        data.cashback.declined += cashback.cashback;
                    }
                    if (cashback.status === AcceptedStatusOpts.pending) {
                        data.cashback.pending += cashback.cashback;
                    }
                });

                referrals.forEach((referral: ReferrerTxn) => {
                    if (referral.status === AcceptedStatusOpts.confirmed) {
                        data.referral.confirmed += referral.referrer_amount;
                    }
                    if (referral.status === AcceptedStatusOpts.declined) {
                        data.referral.declined += referral.referrer_amount;
                    }
                    if (referral.status === AcceptedStatusOpts.pending) {
                        data.referral.pending += referral.referrer_amount;
                    }
                });

                bonuses.forEach((bonus: BonusTxn) => {
                    if (bonus.status === AcceptedStatusOpts.confirmed) {
                        data.bonus.confirmed += Number(bonus.amount);
                    }
                    if (bonus.status === AcceptedStatusOpts.declined) {
                        data.bonus.declined += Number(bonus.amount);
                    }
                    if (bonus.status === AcceptedStatusOpts.pending) {
                        data.bonus.pending += Number(bonus.amount);
                    }
                });

                data.sales.total =
                    data.sales.confirmed +
                    data.sales.pending +
                    data.sales.delayed;
                data.cashback.total =
                    data.cashback.confirmed +
                    data.cashback.pending +
                    data.cashback.delayed;
                data.commission.total =
                    data.commission.confirmed +
                    data.commission.pending +
                    data.commission.delayed;
                data.referral.total =
                    data.referral.confirmed +
                    data.referral.pending +
                    data.referral.delayed;
                data.bonus.total =
                    data.bonus.confirmed +
                    data.bonus.pending +
                    data.bonus.delayed;
                data.profit.total =
                    data.commission.total -
                    data.referral.total -
                    data.bonus.total;

                arr.push(
                    data.sales,
                    data.bonus,
                    data.cashback,
                    data.commission,
                    data.paid,
                    data.profit,
                    data.referral
                );

                res.set({
                    "Access-Control-Expose-Headers": "Content-Range",
                    "Content-Range": `X-Total-Count: ${1} - ${7} / ${7}`,
                });

                res.status(200).send(arr);
            } catch (e) {
                res.status(500).send(e);
            }
        }
    );
};
