import { Request, Express } from "express";
import * as express from "express";
import {
    getAllTxns,
    getAmountStatus,
    withdraw,
} from "../controller/accountController";
import { IsAuthenticated } from "../middleware/AuthMiddleware";

module.exports = (app: Express, passport: any) => {
    require("../passport/jwt")(passport);
    require("../passport/google")(passport);

    var router = express.Router();

    router.use(passport.authenticate("jwt", { session: false }));
    router.use(IsAuthenticated);

    router.route("/alltxns").get(getAllTxns);
    router.route("/walletDetails").get(getAmountStatus);
    router.route("/withdraw").get(withdraw);

    return router;
};
