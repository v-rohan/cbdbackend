import { Request, Express } from "express";
import * as express from "express";
import { getAllTxns, getAmountStatus } from "../controller/accountController";

module.exports = (app: Express, passport: any) => {
    require("../passport/jwt")(passport);
    require("../passport/google")(passport);

    var router = express.Router();

    router.use(passport.authenticate("jwt", { session: false }));

    router.route("/alltxns").get(getAllTxns);
    router.route("/walletDetails").get(getAmountStatus);
};
