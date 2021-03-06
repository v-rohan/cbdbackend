import { Request, Express } from "express";
import * as express from "express";
import multer = require("multer");
import { AdminCheck } from "../middleware/AuthMiddleware";
import {
    deleteMockTxn,
    getMockTxn,
    getMockTxns,
    migrateMockTxns,
    mockTxnUploadCsv,
    postMockTxn,
    postMockTxns,
    putMockTxn,
} from "../controller/Transactions/MockTxnController";
import {
    deleteSalesTxn,
    getSalesTxns,
    getSalesTxn,
    postSalesTxn,
    postSalesTxns,
} from "../controller/Transactions/SalesTxnController";
import {
    getCashbackTxn,
    getCashbackTxns,
    postCashbackTxn,
    postCashbackTxns,
    deleteCashbackTxn,
} from "../controller/Transactions/CashbackTxnController";
import {
    deleteBonusTxn,
    getBonusTxn,
    getBonusTxns,
    postBonusTxn,
    updateBonusTxn,
} from "../controller/Transactions/BonusTxnController";
import {
    deleteReferrerTxn,
    getReferrerTxn,
    getReferrerTxns,
    postReferrerTxn,
    postReferrerTxns,
} from "../controller/Transactions/ReferrerTxnController";

module.exports = (app: Express, passport: any) => {
    require("../passport/jwt")(passport);
    require("../passport/google")(passport);

    var router = express.Router();

    // Middleware
    router.use(passport.authenticate("jwt", { session: false }));
    router.use(AdminCheck);

    // Storage configuration for CSV files
    const storage = multer.diskStorage({
        destination: (request: Request, file: any, cb: any) => {
            cb(null, "./media/mockTxns/");
        },
        filename: (request: Request, file: any, cb: any) => {
            const suffix = Date.now();
            cb(
                null,
                file.originalname.substring(0, file.originalname.length - 4) +
                    "-" +
                    suffix +
                    ".csv"
            );
        },
    });
    const upload = multer({ storage: storage });

    // MockTxn Routes
    router.route("/mock").get(getMockTxns).post(postMockTxns);
    router.post("/mockUpload", upload.single("csv"), mockTxnUploadCsv);
    router
        .route("/mock/:id")
        .get(getMockTxn)
        .post(postMockTxn)
        .delete(deleteMockTxn)
        .put(putMockTxn);

    // Migrate Mock Txns to Sales and Cashback Txns
    router.post("/mockmigratetxns", migrateMockTxns);

    // SalesTxn Routes
    router.route("/sales").get(getSalesTxns).post(postSalesTxns);
    router
        .route("/sales/:id")
        .get(getSalesTxn)
        .post(postSalesTxn)
        .delete(deleteSalesTxn);

    // CashbackTxn Routes
    router.route("/cashback").get(getCashbackTxns).post(postCashbackTxns);
    router
        .route("/cashback/:id")
        .get(getCashbackTxn)
        .post(postCashbackTxn)
        .delete(deleteCashbackTxn);

    // BonusTxn Routes
    router.route("/bonus").get(getBonusTxns).post(postBonusTxn);
    router
        .route("/bonus/:id")
        .get(getBonusTxn)
        .post(updateBonusTxn)
        .delete(deleteBonusTxn);

    // ReferrerTxn Routes
    router.route("/referrer").get(getReferrerTxns).post(postReferrerTxns);
    router
        .route("/referrer/:id")
        .get(getReferrerTxn)
        .post(postReferrerTxn)
        .delete(deleteReferrerTxn);

    return router;
};
