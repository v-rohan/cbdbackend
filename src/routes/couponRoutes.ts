import { Express, Router } from "express";
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
import AdminCheck from "../middleware/AdminCheck";

module.exports = (app: Express, passport: any) => {
    require("../passport/jwt")(passport);
    require("../passport/google")(passport);

    var router = Router();
    router.use(AdminCheck);

    router.route("/coupon").get(getCoupons).post(createCoupon);
    router
        .route("/coupon/:id")
        .get(getCouponById)
        .put(updateCoupon)
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
