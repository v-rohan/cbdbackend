import { Express, Router } from "express";
import multer = require("multer");

import {
    createCoupon,
    createCouponCategory,
    deleteCoupon,
    deleteCouponCategory,
    getCouponById,
    getCouponCategories,
    getCouponCategoryById,
    getCoupons,
    updateCoupon,
    updateCouponCategory,
} from "../controller/couponController";
import { AdminCheckAllowSafe } from "../middleware/AuthMiddleware";
import fileStorageEngine from "../multerStorageEngine";

module.exports = (app: Express, passport: any) => {
    require("../passport/jwt")(passport);
    require("../passport/google")(passport);

    var router = Router();
    router.use(passport.authenticate("jwt", { session: false }));
    router.use(AdminCheckAllowSafe);

    const uploadCouponCategory = multer({
        storage: fileStorageEngine("coupon"),
    });

    router
        .route("/coupon")
        .get(getCoupons)
        .post(uploadCouponCategory.single("featured_image_url"), createCoupon);
    router
        .route("/coupon/:id")
        .get(getCouponById)
        .put(uploadCouponCategory.single("featured_image_url"), updateCoupon)
        .delete(deleteCoupon);

    router
        .route("/couponcategory")
        .get(getCouponCategories)
        .post(createCouponCategory);
    router
        .route("/couponcategory/:id")
        .get(getCouponCategoryById)
        .post(updateCouponCategory)
        .delete(deleteCouponCategory);

    return router;
};
