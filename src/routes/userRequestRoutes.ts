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
} from "../controller/userRequestController";
import { AdminCheck } from "../middleware/AuthMiddleware";

module.exports = (app: Express, passport: any) => {
    require("../passport/jwt")(passport);
    require("../passport/google")(passport);

    var router = express.Router();

    router.use(passport.authenticate("jwt", { session: false }));
    router.use(AdminCheck);

    router.route("/").get(getPayoutRequests);
    router.route("/apiLog").get(getBankPayouts);
    router.post("/bulkTransfer", bulkTransfer);
    router.route("/bankpayouts").get(getBankPayouts);
    router.route("/paytmwalletpayouts").get(getPaytmWalletPayouts);
    router
        .route("/:id")
        .get(getPayoutRequestById)
        .put(updatePayoutRequestById)
        .delete(deletePayoutRequestById);

    return router;
};
