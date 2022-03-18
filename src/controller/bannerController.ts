import { Request, Response } from "express";
import { getRepository } from "typeorm";
import { Banner } from "../entity/Banner";
import { IGetUserAuthInfoRequest } from "../types";

const getBanner = async (req: Request, res: Response) => {
    try {
        const banner = await getRepository(Banner).find();
        res.set({
            "Access-Control-Expose-Headers": "Content-Range",
            "Content-Range": `X-Total-Count: ${1} - ${banner.length} / ${
                banner.length
            }`,
        });
        return res.status(200).json(banner);
    } catch (error) {
        return res.status(400).json(error);
    }
};

const postBanner = async (req: IGetUserAuthInfoRequest, res: Response) => {
    try {
        var banner = new Banner();
        banner = { ...banner, ...req.body, image: req.file.path };
        await getRepository(Banner).save(banner);
        return res.status(201).json(banner);
    } catch (error) {
        return res.status(400).json(error);
    }
};

const deleteBanner = async (req: IGetUserAuthInfoRequest, res: Response) => {
    try {
        const banner = await getRepository(Banner).findOneOrFail({
            where: { id: Number(req.params.id) },
        });
        await getRepository(Banner).remove(banner);
        return res
            .status(204)
            .json({ message: "Banner has been deleted successfully" });
    } catch (err) {
        res.status(400).json({ err });
    }
};

export { getBanner, postBanner, deleteBanner };
