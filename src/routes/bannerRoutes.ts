import { Express, Router, Request } from "express";
import { AdminCheck, AdminCheckAllowSafe } from "../middleware/AuthMiddleware";
import { getBanner, postBanner } from "../controller/bannerController";
import multer = require("multer");

module.exports = (app: Express, passport: any) => {
    require("../passport/jwt")(passport);
    require("../passport/google")(passport);

    const router = Router();
    router.use(passport.authenticate("jwt", { session: false }));
    router.use(AdminCheckAllowSafe);

    // Storage configuration for image files
    const storage = multer.diskStorage({
        destination: (req: Request, file: any, cb: any) => {
            cb(null, "./media/banners/");
        },
        filename: (req: Request, file: any, cb: any) => {
            const suffix = Date.now();
            cb(
                null,
                file.originalname.substring(0, file.originalname.length - 4) +
                    "-" +
                    suffix +
                    file.originalname.substring(
                        file.originalname.length - 4,
                        file.originalname.length
                    )
            );
        },
    });
    const upload = multer({ storage: storage });

    router
        .route("/banner")
        .get(getBanner)
        .post(upload.single("image"), postBanner);
};