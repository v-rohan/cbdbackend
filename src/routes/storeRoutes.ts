import { Express, Router } from "express";
import {
  createStore,
  getAllStores,
  getStoreById,
  updateStoreById,
  deleteStoreById,
} from "../controller/storeController";

import AdminCheck from "../middleware/authMiddleware";

module.exports = (app: Express, passport: any) => {
  require("../passport/jwt")(passport);

  var router = Router();

  // Middleware
  router.use(passport.authenticate("jwt", { session: false }));
  router.use(AdminCheck);

  // AffiliateNetwork Routes
  router.route("/").get(getAllStores).post(createStore);
  router.route("/:id").get(getStoreById).put(updateStoreById).delete(deleteStoreById);

  return router;
};
