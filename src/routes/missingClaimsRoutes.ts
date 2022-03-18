import { Request, Response, Express } from "express";
import * as express from "express";
import {
    getClaimByUser,
    getClaimById,
    updateClaimStaus,
    getAllClaims,
    submitClaim,
} from "../controller/missingClaimsController";
import { AdminCheck, IsAuthenticated } from "../middleware/AuthMiddleware";

module.exports = (app: Express, passport: any) => {
    require("../passport/jwt")(passport);
    require("../passport/google")(passport);

    var router = express.Router();

    router.use(passport.authenticate("jwt", { session: false }));

    router.route("/viewclaims").get(AdminCheck, getClaimByUser);
    router.route("/viewclaims/:id").get(AdminCheck, getClaimById);
    router
        .route("/missingclaims")
        .get(AdminCheck, getAllClaims)
        .post(IsAuthenticated, submitClaim);
    router
        .route("/missingclaims/:id")
        .get(getClaimById)
        .put(AdminCheck, updateClaimStaus);

    return router;
};
