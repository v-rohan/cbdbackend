import { Request, Express } from "express";
import * as express from "express";
import { AdminCheck, AdminCheckAllowSafe } from "../middleware/AuthMiddleware";
import { deleteBankImage, getBankImage, getBankImages, postBankImages, updateBankImage } from "../controller/bankImageController";
import multer = require("multer");

module.exports = (app: Express, passport: any) => {
    require('../passport/jwt')(passport);
    require('../passport/google')(passport);

    var router = express.Router();

    router.use(passport.authenticate(["jwt", "anonymous"], { session: false }));
    router.use(AdminCheckAllowSafe);

    // Storage configuration for image files
    const storage = multer.diskStorage({
        destination: (req: Request, file: any, cb: any) => {
            return cb(null, "./media/bankimgs/");
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

    router.route("/").get(getBankImages).post(upload.single("image"), postBankImages);
    router.route("/:id").get(getBankImage).post(upload.single("image"), updateBankImage).delete(deleteBankImage);

    return router;
}
