import multer = require("multer");
import { Request } from "express";

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

export default fileStorageEngine;
