import { Express, Router } from "express";
import {
  createCashbackRate,
  deleteCashbackRateById,
  getCashbackRatesByStoreId,
  updateCashbackRateById
} from "../controller/cashbackRatesController";

import AdminCheck from "../middleware/AdminCheck";

module.exports = (app: Express, passport: any) => {
  require("../passport/jwt")(passport);

  var router = Router();

  // Middleware
  router.use(passport.authenticate("jwt", { session: false }));
  router.use(AdminCheck);

  // Postback log Routes
  router.route("/").post(createCashbackRate);
  router.route("/:id").put(updateCashbackRateById).delete(deleteCashbackRateById);
  router.route("/store/:id").get(getCashbackRatesByStoreId);

  return router;
};
