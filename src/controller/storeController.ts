import { Request, Response } from "express";
import { getRepository, Like } from "typeorm";
import { Store } from "../entity/Store";
import { StoreCategory } from "../entity/StoreCategory";

const getAllStores = async (req: Request, res: Response) => {
    const stores = await getRepository(Store).find({
        relations: [
            // "network_id",
            // "cashbackRates",
            // "cashbackTxns",
            // "refTxns",
            // "snelinks",
            "categories",
            "coupons",
            // "clicks_id",
        ],
    });
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
            relations: ["categories", "coupons", "network_id"],
        });
        const updatedStore = getRepository(Store).update(st.id, {
            ...st,
            visits: st.visits + 1,
        });
        return res.status(200).json(updatedStore);
    } catch (error) {
        return res.status(404).json({ error: "Store not found" });
    }
};

const getCats = async (req: Request, res: Response) => {
    try {
        const category = await getRepository(StoreCategory).find({
            select: ["name"],
        });
        return res.status(200).json(category);
    } catch (error) {
        return res.status(404).json({ error: "Category not found" });
    }
};

const uploadStoreImage = async (req: Request, res: Response) => {
    try {
        return res.status(200).json({ image: req.file.path });
    } catch (err) {
        return res.status(400).json({ err });
    }
};

const createStore = async (req: Request, res: Response) => {
    try {
        let st = new Store();
        st = { ...st, ...req.body };
        var arr = [];

        let savedStore = await getRepository(Store)
            .save(st)
            .catch((err) => {
                console.log(err);
                throw err;
            });

        req.body.categories.forEach(async (category) => {
            try {
                arr.push(
                    await getRepository(StoreCategory).findOneOrFail({
                        cat_id: category,
                    })
                );
            } catch (err) {
                console.log(err);
            }
        });
        savedStore.categories = arr;
        const updatedStore = await getRepository(Store).save(savedStore);
        return res.status(200).json(updatedStore);
    } catch (error) {
        return res.status(400).json(error);
    }
};

const updateStoreById = async (req: Request, res: Response) => {
    try {
        let st = await getRepository(Store).findOne({
            where: { id: Number(req.params.id) },
        });
        if (st) {
            st = { ...st, ...req.body };
            var arr = [];
            if (req.body.categories) {
                req.body.categories.forEach(async (category) => {
                    try {
                        arr.push(
                            await getRepository(StoreCategory).findOneOrFail({
                                cat_id: category,
                            })
                        );
                    } catch (err) {
                        console.log(err);
                    }
                });
                st.categories = arr;
            }
            const updatedStore = await getRepository(Store)
                .save(st)
                .catch((err) => {
                    console.log(err);
                    throw err;
                });
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
            where: { cat_id: Number(req.params.id) },
            relations: ["stores"],
        });
        return res.status(200).json(category);
    } catch (error) {
        return res.status(404).json({ error: "Category not found" });
    }
};

const getStoresByName = async (req: Request, res: Response) => {
    const stores = await getRepository(Store).find({
        where: { name: Like(`%${req.query.name}%`) },
    });
    return res.status(200).json(stores);
};

const getTopStores = async (req: Request, res: Response) => {
    try {
        const stores = await getRepository(Store).find({
            where: { featured: true },
            order: { cashback_percent: "DESC" },
            take: 10,
        });
        return res.status(200).json(stores);
    } catch (error) {
        return res.status(400).json({ error });
    }
};

const getMostVisitedStores = async (req: Request, res: Response) => {
    try {
        const stores = await getRepository(Store).find({
            order: { visits: "DESC" },
            take: 4,
        });
        return res.status(200).json(stores);
    } catch (err) {
        res.status(400).json({ error: err });
    }
};

// Store Catrgory Controllers
const createStoreCategory = async (req: Request, res: Response) => {
    try {
        let category = new StoreCategory();
        category = { ...req.body, image: req.file.path };
        await getRepository(StoreCategory).save(category);
        return res.status(201).json(category);
    } catch (error) {
        return res.status(400).json(error);
    }
};

const updateStoreCategory = async (req: Request, res: Response) => {
    try {
        var category = await getRepository(StoreCategory).findOneOrFail({
            where: { cat_id: Number(req.params.id) },
        });
        category = { ...category, ...req.body, image: req.file.path };
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
    getStoresByName,
    getTopStores,
    getCats,
    getMostVisitedStores,
    getStoreCategories,
    getStoreCategoryById,
    createStoreCategory,
    updateStoreCategory,
    deleteStoreCategory,
    uploadStoreImage,
};
