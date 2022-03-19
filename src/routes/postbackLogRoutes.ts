import { Express, Router } from "express";
import {
    createOrUpdatePostbackLog,
    deleteLogById,
    getAllLogs,
    getLogById,
    getLogsByNetworkId,
    updateLogById,
} from "../controller/postbackLogController";

import { AdminCheck, AdminCheckAllowUnSafe } from "../middleware/AuthMiddleware";

module.exports = (app: Express, passport: any) => {
    require("../passport/jwt")(passport);

    var router = Router();

    // Middleware
    router.use(passport.authenticate(["jwt", "anonymous"], { session: false }));
    

    // Postback log Routes
    router.route("/").get(AdminCheckAllowUnSafe, getAllLogs)
    router.route("/postback").get(createOrUpdatePostbackLog);
    router.use(AdminCheckAllowUnSafe);
    router
        .route("/:id")
        .get(getLogById)
        .put(updateLogById)
        .delete(deleteLogById);
    router.route("/network/:id").get(getLogsByNetworkId);

    return router;
};
