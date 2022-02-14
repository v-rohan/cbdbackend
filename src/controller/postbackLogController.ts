import { Request, Response } from "express";
import { getRepository } from "typeorm";
import { PostbackLog } from "../entity/PostbackLog";
import { getManager } from "typeorm";
import { SalesTxn } from "../entity/Transactions/SalesTxn";
import { CashbackTxn } from "../entity/Transactions/CashbackTxn";
import { ReferrerTxn } from "../entity/Transactions/ReferrerTxn";
import { Clicks } from "../entity/Clicks";
import { AcceptedStatusOpts, StatusOpts } from "../entity/Transactions/Common";
import { SnE } from "../entity/SnE";

const getAllLogs = async (req: Request, res: Response) => {
    const logs = await getRepository(PostbackLog).find();
    return res.status(200).json(logs);
};

const createOrUpdatePostbackLog = async (req: Request, res: Response) => {
    try {
        let log: PostbackLog = await getRepository(PostbackLog).findOne({
            aff_sub1: req.query.aff_sub1,
        });
        if (!log) log = new PostbackLog();

        let salesTxn: SalesTxn = await getRepository(SalesTxn).findOne({
            aff_sub1: String(req.query.aff_sub1),
        });
        if (!salesTxn) salesTxn = new SalesTxn();

        var click: Clicks = await getRepository(Clicks).findOneOrFail({
            where: { id: req.query.aff_sub1 },
            relations: ["user", "network"],
        });

        var referrerTxn: ReferrerTxn = await getRepository(
            ReferrerTxn
        ).findOneOrFail({
            where: { user: click.user.referralUser },
        });
        if (!referrerTxn) referrerTxn = new ReferrerTxn();

        let cashbackTxn: CashbackTxn = await getRepository(CashbackTxn).findOne(
            { click_id: click }
        );
        if (!cashbackTxn) cashbackTxn = new CashbackTxn();

        await getManager()
            .transaction(async (transactionalEntityManager) => {
                log = { ...log, ...req.query };

                await transactionalEntityManager.save(log);

                Object.keys(salesTxn)
                    .filter((key) => key in req.query)
                    .forEach((key) => {
                        salesTxn[key] = req.query[key];
                    });

                salesTxn.commission_amount = salesTxn.base_commission;
                salesTxn.status =
                    StatusOpts[
                        `${click.network.sale_statuses[`${req.query.status}`]}`
                    ];

                await transactionalEntityManager.save(salesTxn);

                Object.keys(cashbackTxn)
                    .filter((key) => key in req.query)
                    .forEach((key) => {
                        cashbackTxn[key] = req.query[key];
                    });

                cashbackTxn.user = click.user;
                cashbackTxn.store = click.store;
                cashbackTxn.click_id = click;
                cashbackTxn.cashback =
                    (cashbackTxn.sale_amount * click.store.cashback_percent) /
                    100;
                cashbackTxn.txn_date_time = new Date();

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
                    await transactionalEntityManager.save(sne);
                }

                if (click.user.referralUser != null) {
                    referrerTxn.sale_id = cashbackTxn.sale_id;
                    referrerTxn.user = click.user.referralUser;
                    referrerTxn.shopper = click.user;
                    referrerTxn.store = click.store;
                    referrerTxn.sale_amount = cashbackTxn.sale_amount;
                    referrerTxn.currency = "INR";
                    referrerTxn.referrer_amount = cashbackTxn.cashback * 0.1;
                    referrerTxn.mail_sent = false;
                    referrerTxn.txn_date_time = new Date();

                    await transactionalEntityManager.save(referrerTxn);
                }

                await transactionalEntityManager.save(cashbackTxn);
            })
            .then(async () => {
                return res
                    .status(201)
                    .json({ message: "Postback Log created successfully" });
            });
    } catch (error) {
        return res.status(400).json(error);
    }
};

const getLogById = async (req: Request, res: Response) => {
    try {
        const log = await getRepository(PostbackLog).findOneOrFail({
            where: { id: Number(req.params.id) },
            relations: ["affiliateNetwork"],
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
