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
    router.use(passport.authenticate("jwt", { session: false }));
    router.use(AdminCheckAllowUnSafe);

    // Postback log Routes
    router.route("/").get(getAllLogs).post(createOrUpdatePostbackLog);
    router
        .route("/:id")
        .get(getLogById)
        .put(updateLogById)
        .delete(deleteLogById);
    router.route("/network/:id").get(getLogsByNetworkId);

    return router;
};
