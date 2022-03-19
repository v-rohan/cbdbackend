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
import multer = require("multer");
import fileStorageEngine from "../multerStorageEngine";

module.exports = (app: Express, passport: any) => {
    require("../passport/jwt")(passport);
    require("../passport/google")(passport);

    var router = express.Router();

    router.use(passport.authenticate("jwt", { session: false }));

    const missingClaimsUpload = multer({
        storage: fileStorageEngine("claims"),
    });

    router.route("/viewclaims").get(AdminCheck, getClaimByUser);
    router.route("/viewclaims/:id").get(AdminCheck, getClaimById);
    router
        .route("/")
        .get(AdminCheck, getAllClaims)
        .post(
            IsAuthenticated,
            missingClaimsUpload.single("image"),
            submitClaim
        );
    router.route("/:id").get(getClaimById).put(AdminCheck, updateClaimStaus);

    return router;
};
