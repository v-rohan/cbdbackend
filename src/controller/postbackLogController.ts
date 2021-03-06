import { Request, Response } from "express";
import { Double, getRepository } from "typeorm";
import { PostbackLog } from "../entity/PostbackLog";
import { getManager } from "typeorm";
import { SalesTxn } from "../entity/Transactions/SalesTxn";
import { CashbackTxn } from "../entity/Transactions/CashbackTxn";
import { ReferrerTxn } from "../entity/Transactions/ReferrerTxn";
import { Clicks } from "../entity/Clicks";
import { AcceptedStatusOpts, StatusOpts } from "../entity/Transactions/Common";
import { SnE } from "../entity/SnE";
import { User } from "../entity/User";
import { Settings } from "../entity/Settings";
import { publishMail } from "../tasks/publishMail";

const getAllLogs = async (req: Request, res: Response) => {
    const logs = await getRepository(PostbackLog).find({
        relations: ["network_id"],
    });
    res.set({
        "Access-Control-Expose-Headers": "Content-Range",
        "Content-Range": `X-Total-Count: ${1} - ${logs.length} / ${
            logs.length
        }`,
    });
    return res.status(200).json(logs);
};

const createOrUpdatePostbackLog = async (req: Request, res: Response) => {
    try {
        var cbTrac = false, cbUpd = false;
        var log = new PostbackLog();

        try {
            log = await getRepository(PostbackLog).findOneOrFail({
                aff_sub1: req.query.aff_sub1,
            });
        } catch (err) {
            log = new PostbackLog();
        }

        var salesTxn = new SalesTxn();
        try {
            salesTxn = await getRepository(SalesTxn).findOneOrFail({
                aff_sub1: String(req.query.aff_sub1),
            });
        } catch (err) {
            salesTxn = new SalesTxn();
        }

        var click = await getRepository(Clicks).findOneOrFail({
            where: { id: req.query.aff_sub1 },
            relations: ["user", "network", "store"],
        });

        try {
            var referrerTxn = new ReferrerTxn();
            referrerTxn = await getRepository(ReferrerTxn).findOneOrFail({
                where: { user: click.user.referralUser },
            });
        } catch (err) {
            referrerTxn = new ReferrerTxn();
        }

        var cashbackTxn = new CashbackTxn();
        try {
            cashbackTxn = await getRepository(CashbackTxn).findOneOrFail({
                where: {click_id: click},
                relations: ['user', 'store']
            });
            if (cashbackTxn) {
                cbUpd = true;
            }
        } catch (err) {
            cashbackTxn = new CashbackTxn();
            cbTrac = true;
        }

        await getManager()
            .transaction(async (transactionalEntityManager) => {
                log = { ...log, ...req.query };

                await transactionalEntityManager.connection
                    .getRepository(PostbackLog)
                    .save(log);

                // console.log(
                //     Object.keys(
                //         await transactionalEntityManager.connection.getMetadata(
                //             SalesTxn
                //         ).propertiesMap
                //     )
                // );

                Object.keys(
                    await transactionalEntityManager.connection.getMetadata(
                        SalesTxn
                    ).propertiesMap
                )
                    .filter((key: any) => key in req.query)
                    .forEach((keyto: any) => {
                        //console.log("HELLO", keyto);
                        salesTxn[keyto] = req.query[keyto];
                    });

                salesTxn.commission_amount = Number(req.query.base_commission);
                salesTxn.transaction_id = String(req.query.transaction_id);
                salesTxn.user = click.user;
                salesTxn.store = click.store;
                var ss = JSON.parse(click.network.sale_statuses);

                salesTxn.status = StatusOpts[`${ss[`${req.query.status}`]}`];

                Object.keys(ss).forEach((ele) => {
                    console.log(ele);
                    if (ele === req.query.status) {
                        console.log("maralo");
                    }
                });
                console.log(
                    click.network.sale_statuses,
                    req.query.status,
                    ss[`${req.query.status}`]
                );

                salesTxn.sale_status = `${
                    click.network.sale_statuses[`${req.query.status}`]
                }`;
                await transactionalEntityManager.connection
                    .getRepository(SalesTxn)
                    .save(salesTxn);

                console.log(cashbackTxn);

                Object.keys(
                    await transactionalEntityManager.connection.getMetadata(
                        CashbackTxn
                    ).propertiesMap
                )
                    .filter((key: any) => key in req.query)
                    .forEach((key: any) => {
                        cashbackTxn[key] = req.query[key];
                    });

                cashbackTxn.user = click.user;
                cashbackTxn.store = click.store;
                cashbackTxn.click_id = click;
                cashbackTxn.cashback =
                    (cashbackTxn.sale_amount * click.store.cashback_percent) /
                    100;
                cashbackTxn.txn_date_time = new Date();

                console.log(AcceptedStatusOpts[salesTxn.status]);

                if (salesTxn.status == StatusOpts.delayed) {
                    cashbackTxn.status = AcceptedStatusOpts.pending;
                    referrerTxn.status = AcceptedStatusOpts.pending;
                } else {
                    cashbackTxn.status = AcceptedStatusOpts[salesTxn.status];
                    referrerTxn.status = AcceptedStatusOpts[salesTxn.status];
                }

                if (
                    cashbackTxn.status == AcceptedStatusOpts.confirmed &&
                    click.ref != null
                ) {
                    var sne: SnE = await transactionalEntityManager.connection
                        .getRepository(SnE)
                        .findOneOrFail({ shortlink: click.ref });

                    sne.earning += cashbackTxn.cashback;
                    await transactionalEntityManager.connection
                        .getRepository(SnE)
                        .save(sne);
                }

                if (click.user.referralUser != null) {
                    var settings = await getRepository(Settings).find()[0];
                    if (settings.referralEnabled) {
                        referrerTxn.sale_id = cashbackTxn.sale_id;
                        referrerTxn.user = await getRepository(User).findOne({
                            where: { id: click.user.referralUser },
                        });
                        referrerTxn.shopper = click.user;
                        referrerTxn.store = click.store;
                        referrerTxn.sale_amount = cashbackTxn.sale_amount;
                        referrerTxn.currency = "INR";
                        referrerTxn.referrer_amount =
                            (cashbackTxn.cashback *
                                settings.referralPercent *
                                1.0) /
                            100.0;
                        referrerTxn.mail_sent = false;
                        referrerTxn.txn_date_time = new Date();

                        await transactionalEntityManager.connection
                            .getRepository(ReferrerTxn)
                            .save(referrerTxn);
                    }
                }

                await transactionalEntityManager.connection
                    .getRepository(CashbackTxn)
                    .save(cashbackTxn);
            })
            .then(async () => {
                publishMail({
                    template: 'cashbackUpdate',
                    message: {
                        to: cashbackTxn.user.email.toString(),
                    },
                    locals: {
                        first_name: cashbackTxn.user.first_name,
                        last_name: cashbackTxn.user.last_name,
                        store: cashbackTxn.store,
                        date: cashbackTxn.txn_date_time,
                        txnAmount: cashbackTxn.sale_amount,
                        cbAmount: cashbackTxn.cashback,
                        status: cashbackTxn.status.toUpperCase()
                    },
                });
                return res
                    .status(201)
                    .json({ message: "Postback Log created successfully" });
            });
    } catch (error) {
        console.log(error);

        return res.status(400).send(error);
    }
};

const getLogById = async (req: Request, res: Response) => {
    try {
        const log = await getRepository(PostbackLog).findOneOrFail({
            where: { id: Number(req.params.id) },
            relations: ["network_id"],
        });
        return res.status(200).json(log);
    } catch (error) {
        return res.status(404).json({ error: "Postback Log not found" });
    }
};

const getLogsByNetworkId = async (req: Request, res: Response) => {
    try {
        const logs = await getRepository(PostbackLog).find({
            where: { affiliateNetwork: Number(req.params.id) },
        });
        return res.status(200).json(logs);
    } catch (error) {
        return res.status(400).json({ error });
    }
};

const updateLogById = async (req: Request, res: Response) => {
    try {
        const log = await getRepository(PostbackLog).findOneOrFail({
            where: { id: Number(req.params.id) },
        });
        if (log) {
            getRepository(PostbackLog).merge(log, { ...req.body });
            const updatedNetwork = await getRepository(PostbackLog).save(log);
            return res.status(200).json(updatedNetwork);
        }
    } catch (err) {
        return res.status(400).json(err);
    }
};

const deleteLogById = async (req: Request, res: Response) => {
    try {
        const log = await getRepository(PostbackLog).findOneOrFail({
            where: { id: Number(req.params.id) },
        });
        await getRepository(PostbackLog).remove(log);
        return res
            .status(204)
            .json({ message: "Postback Log has been deleted successfully" });
    } catch (err) {
        return res.status(400).json(err);
    }
};

export {
    getAllLogs,
    createOrUpdatePostbackLog,
    getLogById,
    getLogsByNetworkId,
    updateLogById,
    deleteLogById,
};
