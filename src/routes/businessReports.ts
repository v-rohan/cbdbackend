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
                        id: 1,
                        header: "Sales",
                        pending: 0,
                        confirmed: 0,
                        delayed: 0,
                        declined: 0,
                        total: 0,
                    },
                    commission: {
                        id: 2,
                        header: "Commission",
                        pending: 0,
                        confirmed: 0,
                        delayed: 0,
                        declined: 0,
                        total: 0,
                    },
                    cashback: {
                        id: 3,
                        header: "Cashback",
                        pending: 0,
                        confirmed: 0,
                        delayed: 0,
                        declined: 0,
                        total: 0,
                    },
                    referral: {
                        id: 4,
                        header: "Referral",
                        pending: 0,
                        confirmed: 0,
                        delayed: 0,
                        declined: 0,
                        total: 0,
                    },
                    bonus: {
                        id: 5,
                        header: "Bonus",
                        pending: 0,
                        confirmed: 0,
                        delayed: 0,
                        declined: 0,
                        total: 0,
                    },
                    profit: {
                        id: 6,
                        header: "Profit",
                        pending: 0,
                        confirmed: 0,
                        delayed: 0,
                        declined: 0,
                        total: 0,
                    },
                    paid: {
                        id: 7,
                        header: "Paid",
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
                        data.sales.confirmed += Number(sale.sale_amount);
                        data.commission.confirmed += Number(
                            sale.commission_amount
                        );
                    }
                    if (sale.status === StatusOpts.declined) {
                        data.sales.declined += Number(sale.sale_amount);
                        data.commission.declined += Number(
                            sale.commission_amount
                        );
                    }
                    if (sale.status === StatusOpts.delayed) {
                        data.sales.delayed += Number(sale.sale_amount);
                        data.commission.delayed += Number(
                            sale.commission_amount
                        );
                    }
                    if (sale.status === StatusOpts.pending) {
                        data.sales.pending += Number(sale.sale_amount);
                        data.commission.pending += Number(
                            sale.commission_amount
                        );
                    }
                });

                cashbacks.forEach((cashback: CashbackTxn) => {
                    if (cashback.status === AcceptedStatusOpts.confirmed) {
                        data.cashback.confirmed += Number(cashback.cashback);
                    }
                    if (cashback.status === AcceptedStatusOpts.declined) {
                        data.cashback.declined += Number(cashback.cashback);
                    }
                    if (cashback.status === AcceptedStatusOpts.pending) {
                        data.cashback.pending += Number(cashback.cashback);
                    }
                });

                referrals.forEach((referral: ReferrerTxn) => {
                    if (referral.status === AcceptedStatusOpts.confirmed) {
                        data.referral.confirmed += Number(
                            referral.referrer_amount
                        );
                    }
                    if (referral.status === AcceptedStatusOpts.declined) {
                        data.referral.declined += Number(
                            referral.referrer_amount
                        );
                    }
                    if (referral.status === AcceptedStatusOpts.pending) {
                        data.referral.pending += Number(
                            referral.referrer_amount
                        );
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
                    Number(data.sales.confirmed) +
                    Number(data.sales.pending) +
                    Number(data.sales.delayed);
                data.cashback.total =
                    Number(data.cashback.confirmed) +
                    Number(data.cashback.pending) +
                    Number(data.cashback.delayed);
                data.commission.total =
                    Number(data.commission.confirmed) +
                    Number(data.commission.pending) +
                    Number(data.commission.delayed);
                data.referral.total =
                    Number(data.referral.confirmed) +
                    Number(data.referral.pending) +
                    Number(data.referral.delayed);
                data.bonus.total =
                    Number(data.bonus.confirmed) +
                    Number(data.bonus.pending) +
                    Number(data.bonus.delayed);
                data.profit.total =
                    Number(data.commission.total) -
                    Number(data.referral.total) -
                    Number(data.bonus.total);

                arr.push(
                    data.sales,
                    data.commission,
                    data.cashback,
                    data.referral,
                    data.bonus,
                    data.profit,
                    data.paid
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
