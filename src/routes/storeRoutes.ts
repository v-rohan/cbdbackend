import { Express, Router } from "express";
import {
    createStore,
    getAllStores,
    getStoreById,
    updateStoreById,
    deleteStoreById,
    getCategories,
    getCategoryById,
} from "../controller/storeController";

import AdminCheck from "../middleware/AdminCheck";

module.exports = (app: Express, passport: any) => {
    require("../passport/jwt")(passport);
    require("../passport/google")(passport);

    var router = Router();

    // Middleware
    router.use(passport.authenticate("jwt", { session: false }));
    router.use(AdminCheck);

    // Store Routes
    router.route("/").get(getAllStores).post(createStore);
    router
        .route("/:id")
        .get(getStoreById)
        .put(updateStoreById)
        .delete(deleteStoreById);

    // Store Category Routes
    router.route("/category").get(getCategories);
    router.route("/category/:id").get(getCategoryById);

    return router;
};
