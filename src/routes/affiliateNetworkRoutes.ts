import { Express, Router } from "express";
import {
  createNetwork,
  getAllNetworks,
  getNetworkById,
  updateNetworkById,
  deleteNetworkById,
} from "../controller/affiliateNetworkController";

import AdminCheck from "../middleware/AdminCheck";

module.exports = (app: Express, passport: any) => {
  require("../passport/jwt")(passport);

  var router = Router();

  // Middleware
  router.use(passport.authenticate("jwt", { session: false }));
  router.use(AdminCheck);

  // AffiliateNetwork Routes
  router.route("/").get(getAllNetworks).post(createNetwork);
  router
    .route("/:id")
    .get(getNetworkById)
    .put(updateNetworkById)
    .delete(deleteNetworkById);

  return router;
};
