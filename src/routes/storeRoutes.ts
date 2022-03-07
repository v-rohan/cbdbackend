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
    getCats,
    deleteStoreCategory,
    getStoresByName,
    getTopStores,
    uploadStoreImage,
    getMostVisitedStores,
} from "../controller/storeController";

import { AdminCheckAllowSafe } from "../middleware/AuthMiddleware";

const fileStorageEngine = (path: string) => {
    const storage: multer.StorageEngine = multer.diskStorage({
        destination: (req: Request, file: any, cb: any) => {
            cb(null, `./media/${path}/`);
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

    return storage;
};

module.exports = (app: Express, passport: any) => {
    require("../passport/jwt")(passport);
    require("../passport/google")(passport);

    var router = Router();

    // Middleware
    router.use(passport.authenticate(["jwt", "anonymous"], { session: false }));
    router.use(AdminCheckAllowSafe);

    const storeStorage = fileStorageEngine("store");
    const uploadStore = multer({ storage: storeStorage });

    // Store Routes
    router.route("/").get(getAllStores).post(createStore);
    router.post("/upload", uploadStore.single("image"), uploadStoreImage);

    const categoryStorage = fileStorageEngine("category");
    const uploadCategory = multer({ storage: categoryStorage });

    // Store Category Routes
    router
        .route("/category")
        .get(getStoreCategories)
        .post(uploadCategory.single("image"), createStoreCategory);
    router
        .route("/category/:id")
        .get(getStoreCategoryById)
        .put(uploadCategory.single("image"), updateStoreCategory)
        .delete(deleteStoreCategory);
    
    router.route("/getcats").get(getCats)

    router.route("/search").get(getStoresByName);
    router.route("/featured").get(getTopStores);
    router.get("/visited", getMostVisitedStores);

    router
        .route("/:id")
        .get(getStoreById)
        .put(updateStoreById)
        .delete(deleteStoreById);

    return router;
};
