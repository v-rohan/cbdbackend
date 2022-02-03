import { Request, Express } from "express";
import * as express from "express";
import {
    bulkTransfer,
    getPayoutRequests,
    getPayoutRequestById,
    updatePayoutRequestById,
    deletePayoutRequestById,
    getBankPayouts,
    getPaytmWalletPayouts,
} from "../controller/UserRequestController";
import AdminCheck from "../middleware/AdminCheck";

module.exports = (app: Express, passport: any) => {
    require("../passport/jwt")(passport);
    require("../passport/google")(passport);

    var router = express.Router();

    router.use(passport.authenticate("jwt", { session: false }));
    router.use(AdminCheck);

    router.route("/payoutrequests").get(getPayoutRequests);
    router
        .route("/payoutrequests/:id")
        .get(getPayoutRequestById)
        .put(updatePayoutRequestById)
        .delete(deletePayoutRequestById);
    router.post("/bulkTransfer", bulkTransfer);
    router.route("/bankpayouts").get(getBankPayouts);
    router.route("/paytmwalletpayouts").get(getPaytmWalletPayouts);
};
