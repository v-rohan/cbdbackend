import { Express, Router, Request } from "express";
import { AdminCheck, AdminCheckAllowSafe } from "../middleware/AuthMiddleware";
import {
    deleteBanner,
    getBanner,
    postBanner,
} from "../controller/bannerController";
import multer = require("multer");
const AnonymousStrategy = require("passport-anonymous").Strategy;

module.exports = (app: Express, passport: any) => {
    require("../passport/jwt")(passport);
    require("../passport/google")(passport);
    passport.use(new AnonymousStrategy());

    const router = Router();
    router.use(passport.authenticate(["jwt", "anonymous"], { session: false }));
    router.use(AdminCheckAllowSafe);

    // Storage configuration for image files
    const storage = multer.diskStorage({
        destination: (req: Request, file: any, cb: any) => {
            cb(null, "./media/banners/");
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
    const upload = multer({ storage: storage });

    router.route("/").get(getBanner).post(upload.single("image"), postBanner);
    router.route("/:id").delete(deleteBanner);

    return router;
};
