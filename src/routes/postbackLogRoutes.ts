import { Express, Router } from "express";
import {
  createPostbackLog,
  deleteLogById,
  getAllLogs,
  getLogById,
  getLogsByNetworkId,
  updateLogById,
} from "../controller/postbackLogController";

import AdminCheck from "../middleware/authMiddleware";

module.exports = (app: Express, passport: any) => {
  require("../passport/jwt")(passport);

  var router = Router();

  // Middleware
  router.use(passport.authenticate("jwt", { session: false }));
  router.use(AdminCheck);

  // Postback log Routes
  router.route("/").get(getAllLogs).post(createPostbackLog);
  router.route("/:id").get(getLogById).put(updateLogById).delete(deleteLogById);
  router.route("/network/:id").get(getLogsByNetworkId);

  return router;
};
