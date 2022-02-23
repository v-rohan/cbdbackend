import { Request, Response } from "express";
import { getRepository } from "typeorm";
import { BankImage } from "../entity/BankImages";

const getBankImages = async (req: Request, res: Response) => {
    const bankImages = await getRepository(BankImage).find();
    return res.status(200).json(bankImages)
}

const postBankImages = async (req: Request, res: Response) => {
    var newbi = new BankImage();
    newbi = { ...newbi, ...req.body, image: req.file.path };
    await getRepository(BankImage).save(newbi);
    return res.status(201).json(newbi);
}

const getBankImage = async (req: Request, res: Response) => {
    try {
        var bi = await getRepository(BankImage).findOneOrFail({
            where: { id: Number(req.params.id) }
        })
        return res.status(200).json(bi);
    } catch (err) {
        return res.status(400).json(err);
    }
}

const updateBankImage = async (req: Request, res: Response) => {
    try {
        var bi = await getRepository(BankImage).findOneOrFail({
            where: { id: Number(req.params.id) }
        })
        bi = { ...bi, ...req.body, image: req.file.path };
        return res.status(200).json(bi);
    } catch (err) {
        return res.status(400).json(err);
    }
}

const deleteBankImage = async (req: Request, res: Response) => {
    try {
        const bi = await getRepository(BankImage).findOneOrFail({
            where: { id: Number(req.params.id) },
        });
        await getRepository(BankImage).remove(bi);
        return res
            .status(204)
            .json({ message: "Banner has been deleted successfully" });
    } catch (err) {
        res.status(400).json({ err });
    }
}

export {
    getBankImages,
    postBankImages,
    getBankImage,
    deleteBankImage,
    updateBankImage
}