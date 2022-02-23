import { Request, Express } from "express";
import * as express from "express";
import {
    getAllTxns,
    getAmountStatus,
    withdraw,
    getRewardTxnByUserByMonth,
    getCashbackTxnsByUserByMonth,
    getClicksByUserByMonth,
    claimBonus,
    getBonusTxnByUser,
    payoutsByUserByMonth
} from "../controller/accountController";
import { getCashbackTxnByUser } from "../controller/Transactions/CashbackTxnController";

module.exports = (app: Express, passport: any) => {
    require("../passport/jwt")(passport);
    require("../passport/google")(passport);

    var router = express.Router();

    router.use(passport.authenticate("jwt", { session: false }));

    router.route("/alltxns").get(getAllTxns);
    router.route("/walletDetails").get(getAmountStatus);
    router.route("/withdraw").post(withdraw);
    router.route("/payouts").get(payoutsByUserByMonth);
    router.route("/cashback").get(getCashbackTxnByUser);
    router.route("/bonus").get(getBonusTxnByUser);
    router.route("/clicks/month").get(getClicksByUserByMonth);
    router.route("/txns/cashback").get(getCashbackTxnsByUserByMonth);
    router.route("/txns/rewards").get(getRewardTxnByUserByMonth);
    router.route("/bonus/claim/:id").get(claimBonus);

    return router;
};
