import { Express, Router } from "express";
import {
    createStore,
    getAllStores,
    getStoreById,
    updateStoreById,
    deleteStoreById,
    getStoreCategories,
    getStoreCategoryById,
    createStoreCategory,
    updateStoreCategory,
    deleteStoreCategory,
} from "../controller/storeController";

import { AdminCheckAllowSafe } from "../middleware/AuthMiddleware";

module.exports = (app: Express, passport: any) => {
    require("../passport/jwt")(passport);
    require("../passport/google")(passport);

    var router = Router();

    // Middleware
    router.use(passport.authenticate("jwt", { session: false }));
    router.use(AdminCheckAllowSafe);

    // Store Routes
    router.route("/").get(getAllStores).post(createStore);
    router
        .route("/:id")
        .get(getStoreById)
        .put(updateStoreById)
        .delete(deleteStoreById);

    // Store Category Routes
    router.route("/category").get(getStoreCategories).post(createStoreCategory);
    router
        .route("/category/:id")
        .get(getStoreCategoryById)
        .post(updateStoreCategory)
        .delete(deleteStoreCategory);

    return router;
};
