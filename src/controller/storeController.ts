import { Request, Response } from "express";
import { getRepository } from "typeorm";
import { Store } from "../entity/Store";
import { StoreCategory } from "../entity/StoreCategory";

const getAllStores = async (req: Request, res: Response) => {
    const stores = await getRepository(Store).find();
    res.set({
        "Access-Control-Expose-Headers": "Content-Range",
        "Content-Range": `X-Total-Count: ${1} - ${stores.length} / ${
            stores.length
        }`,
    });
    return res.status(200).json(stores);
};

const getStoreById = async (req: Request, res: Response) => {
    try {
        const st = await getRepository(Store).findOneOrFail({
            where: { id: Number(req.params.id) },
        });
        return res.status(200).json(st);
    } catch (error) {
        return res.status(404).json({ error: "Store not found" });
    }
};

const createStore = async (req: Request, res: Response) => {
    try {
        let st = new Store();
        st = { ...req.body };
        await getRepository(Store).save(st);
        return res.status(201).json(st);
    } catch (error) {
        return res.status(400).json(error);
    }
};

const updateStoreById = async (req: Request, res: Response) => {
    try {
        const st = await getRepository(Store).findOne({
            where: { id: Number(req.params.id) },
        });
        if (st) {
            getRepository(Store).merge(st, { ...req.body });
            const updatedStore = await getRepository(Store).save(st);
            return res.status(200).json(updatedStore);
        }
    } catch (err) {
        return res.status(400).json(err);
    }
};

const deleteStoreById = async (req: Request, res: Response) => {
    try {
        const st = await getRepository(Store).findOneOrFail({
            where: { id: Number(req.params.id) },
        });
        await getRepository(Store).remove(st);
        return res
            .status(204)
            .json({ message: "Store has been deleted successfully" });
    } catch (err) {
        return res.status(400).json(err);
    }
};

const getStoreCategories = async (req: Request, res: Response) => {
    try {
        const categories = await getRepository(StoreCategory).find({
            relations: ["stores"],
        });
        return res.status(200).json(categories);
    } catch (error) {
        return res.status(400).json(error);
    }
};

const getStoreCategoryById = async (req: Request, res: Response) => {
    try {
        const category = await getRepository(StoreCategory).findOneOrFail({
            where: { id: Number(req.params.id) },
            relations: ["stores"],
        });
        return res.status(200).json(category);
    } catch (error) {
        return res.status(404).json({ error: "Category not found" });
    }
};

const createStoreCategory = async (req: Request, res: Response) => {
    try {
        let category = new StoreCategory();
        category = { ...req.body };
        await getRepository(StoreCategory).save(category);
        return res.status(201).json(category);
    } catch (error) {
        return res.status(400).json(error);
    }
};

const updateStoreCategory = async (req: Request, res: Response) => {
    try {
        const category = await getRepository(StoreCategory).findOneOrFail({
            where: { id: Number(req.params.id) },
        });
        getRepository(StoreCategory).merge(category, { ...req.body });
        const updatedCategory = await getRepository(StoreCategory).save(
            category
        );
        return res.status(200).json(updatedCategory);
    } catch (err) {
        return res.status(400).json(err);
    }
};

const deleteStoreCategory = async (req: Request, res: Response) => {
    try {
        const category = await getRepository(StoreCategory).findOneOrFail({
            where: { id: Number(req.params.id) },
        });
        if (category) {
            await getRepository(StoreCategory).remove(category);
            return res
                .status(204)
                .json({ message: "Category has been deleted successfully" });
        }
    } catch (err) {
        return res.status(400).json(err);
    }
};

export {
    getAllStores,
    getStoreById,
    createStore,
    updateStoreById,
    deleteStoreById,
    getStoreCategories,
    getStoreCategoryById,
    createStoreCategory,
    updateStoreCategory,
    deleteStoreCategory,
};
