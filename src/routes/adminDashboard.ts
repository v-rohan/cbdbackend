import { Express, Request, Response } from "express";
import * as express from "express";
import { AdminCheck } from "../middleware/AuthMiddleware";
import { getRepository } from "typeorm";
import { SalesTxn } from "../entity/Transactions/SalesTxn";
import { CashbackTxn } from "../entity/Transactions/CashbackTxn";
import { BonusTxn } from "../entity/Transactions/BonusTxn";

module.exports = (app: Express, passport: any) => {
    require("../passport/jwt")(passport);
    require("../passport/google")(passport);

    var router = express.Router();

    router.use(passport.authenticate("jwt", { session: false }));
    router.use(AdminCheck);

    router.get("/", async (req: Request, res: Response) => {
        let totalEarnings = 0;
        let totalBonus = 0;
        let totalCashback = 0;

        (await getRepository(SalesTxn).find()).forEach(
            (txn) => (totalEarnings += Number(txn.commission_amount))
        );

        (await getRepository(CashbackTxn).find()).forEach(
            (txn) => (totalCashback += Number(txn.cashback))
        );

        (await getRepository(BonusTxn).find()).forEach(
            (txn) => (totalBonus += Number(txn.amount))
        );

        const netProfit = totalEarnings - totalCashback - totalBonus;

        var days = [];
        for (var i = 0; i < 7; i++) {
            var d = new Date();
            d.setDate(d.getDate() - 7 + i);
            days.push(d);
        }

        // return(result.join(','));

        res.json(200).json({
            totalEarnings,
            totalCashback,
            totalBonus,
            netProfit,
        });
    });

    return router;
};
