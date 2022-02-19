import { Express, Request, Router } from "express";
import multer = require("multer");
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
    getStoresByName,
} from "../controller/storeController";

import { AdminCheckAllowSafe } from "../middleware/AuthMiddleware";

module.exports = (app: Express, passport: any) => {
    require("../passport/jwt")(passport);
    require("../passport/google")(passport);

    var router = Router();

    // Middleware
    router.use(passport.authenticate(["jwt", "anonymous"], { session: false }));
    router.use(AdminCheckAllowSafe);

    // Store Routes
    router.route("/").get(getAllStores).post(createStore);

    const storage = multer.diskStorage({
        destination: (req: Request, file: any, cb: any) => {
            cb(null, "./media/category/");
        },
        filename: (req: Request, file: any, cb: any) => {
            cb(
                null,
                file.originalname
                    .replace(new RegExp(" ", "g"), "-")
                    .substring(0, file.originalname.length - 4) +
                    "-" +
                    Date.now() +
                    file.originalname.substring(
                        file.originalname.length - 4,
                        file.originalname.length
                    )
            );
        },
    });
    const upload = multer({ storage });

    // Store Category Routes
    router
        .route("/category")
        .get(getStoreCategories)
        .post(upload.single("image"), createStoreCategory);
    router
        .route("/category/:id")
        .get(getStoreCategoryById)
        .put(updateStoreCategory)
        .delete(deleteStoreCategory);

    router.route("/search").get(getStoresByName);

    router
        .route("/:id")
        .get(getStoreById)
        .put(updateStoreById)
        .delete(deleteStoreById);

    return router;
};
