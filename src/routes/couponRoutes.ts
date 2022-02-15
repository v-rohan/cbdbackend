import { Express, Router } from "express";
import {
    createCoupon,
    deleteCoupon,
    getCouponById,
    getCoupons,
    updateCoupon,
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
};
