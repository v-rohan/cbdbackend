import { Request, Response } from "express";
import { getRepository } from "typeorm";
import { CashbackRates } from "../entity/CashbackRates";

const getCashbackRates = async (req: Request, res: Response) => {
    try {
        const cbRates = await getRepository(CashbackRates).find({
            relations: ["store"],
        });
        res.set({
            "Access-Control-Expose-Headers": "Content-Range",
            "Content-Range": `X-Total-Count: ${1} - ${cbRates.length} / ${
                cbRates.length
            }`,
        });
        return res.status(200).json(cbRates);
    } catch (err) {
        return res.status(400).json(err);
    }
};

const createCashbackRate = async (req: Request, res: Response) => {
    try {
        let cbRates = new CashbackRates();
        cbRates = { ...req.body };
        await getRepository(CashbackRates).save(cbRates);
        return res.status(201).json(cbRates);
    } catch (error) {
        return res.status(400).json(error);
    }
};

const getCashbackRatesByStoreId = async (req: Request, res: Response) => {
    try {
        const cbRates = await getRepository(CashbackRates).find({
            where: { store: Number(req.params.id) },
        });
        return res.status(200).json(cbRates);
    } catch (error) {
        return res.status(400).json({ error });
    }
};

const getCashbackRateById = async (req: Request, res: Response) => {
    try {
        const cbRates = await getRepository(CashbackRates).find({
            where: { id: Number(req.params.id) },
            relations: ["store"],
        });
        return res.status(200).json(cbRates);
    } catch (error) {
        return res.status(400).json({ error });
    }
};

const updateCashbackRateById = async (req: Request, res: Response) => {
    try {
        const cbRates = await getRepository(CashbackRates).findOneOrFail({
            where: { id: Number(req.params.id) },
        });
        if (cbRates) {
            getRepository(CashbackRates).merge(cbRates, { ...req.body });
            const updatedStore = await getRepository(CashbackRates).save(
                cbRates
            );
            return res.status(200).json(updatedStore);
        }
    } catch (err) {
        return res.status(400).json(err);
    }
};

const deleteCashbackRateById = async (req: Request, res: Response) => {
    try {
        const cbRates = await getRepository(CashbackRates).findOneOrFail({
            where: { id: Number(req.params.id) },
        });
        await getRepository(CashbackRates).remove(cbRates);
        return res
            .status(204)
            .json({ message: "Cashback Rate has been deleted successfully" });
    } catch (err) {
        return res.status(400).json(err);
    }
};

export {
    getCashbackRates,
    createCashbackRate,
    getCashbackRateById,
    deleteCashbackRateById,
    getCashbackRatesByStoreId,
    updateCashbackRateById,
};
