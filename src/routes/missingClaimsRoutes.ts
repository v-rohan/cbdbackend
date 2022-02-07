import { Request, Response, Express } from "express";
import * as express from "express";
import {
    getClaimByUser,
    getClaimById,
    updateClaimStaus,
    getAllClaims,
} from "../controller/missingClaimsController";

module.exports = (app: Express, passport: any) => {
    require("../passport/jwt")(passport);
    require("../passport/google")(passport);

    var router = express.Router();

    router.route("/submitclaim").post();
    router.route("/viewclaims").get(getClaimByUser);
    router.route("/viewclaims/:id").get(getClaimById);
    router.route("/missingclaims").get(getAllClaims);
    router.route("/missingclaims/:id").get(getClaimById).put(updateClaimStaus);

    return router;
};
