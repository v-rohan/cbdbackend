import { Request, Response } from "express";
import { getRepository, ILike } from "typeorm";
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
            "network_id",
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
            relations: ["categories", "coupons", "network_id", "cashbackRates"],
        });
        const updatedStore = getRepository(Store).update(st.id, {
            ...st,
            visits: st.visits + 1,
        });
        return res.status(200).json(st);
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
        if (req.file.path) {
            st = { ...st, ...req.body, image: req.file.path };
        } else {
            st = { ...st, ...req.body };
        }
        var arr = [];

        if (req.body.is_claimable === "true") {
            st.is_claimable = true;
        }

        if (req.body.featured === "true") {
            st.featured = true;
        }

        if (req.body.cashback_enabled === "true") {
            st.cashback_enabled = true;
        }

        let savedStore = await getRepository(Store)
            .save(st)
            .catch((err) => {
                console.log(err);
                throw err;
            });
        console.log(req.body.categories);
        req.body.categories.split(",").forEach(async (category) => {
            try {
                arr.push(
                    await getRepository(StoreCategory).findOneOrFail({
                        cat_id: Number(category),
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
        console.log(error);
        return res.status(400).json(error);
    }
};

const updateStoreById = async (req: Request, res: Response) => {
    try {
        let st = await getRepository(Store).findOne({
            where: { id: Number(req.params.id) },
        });
        if (st) {
            if (req.file) {
                st = { ...st, ...req.body, image: req.file.path };
            } else {
                st = { ...st, ...req.body };
            }
            if (req.body.is_claimable === "true") {
                st.is_claimable = true;
            }

            if (req.body.featured === "true") {
                st.featured = true;
            }

            if (req.body.cashback_enabled === "true") {
                st.cashback_enabled = true;
            }
            var arr = [];
            let savedStore = await getRepository(Store)
                .save(st)
                .catch((err) => {
                    console.log(err);
                    throw err;
                });
            console.log(req.body.categories);
            req.body.categories.split(",").forEach(async (category) => {
                try {
                    arr.push(
                        await getRepository(StoreCategory).findOneOrFail({
                            cat_id: Number(category),
                        })
                    );
                } catch (err) {
                    console.log(err);
                }
            });
            savedStore.categories = arr;
            const updatedStore = await getRepository(Store).save(savedStore);
            return res.status(200).json(updatedStore);
        }
    } catch (err) {
        console.log(err);

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
        const updatedCategories = categories.map((category) => ({
            ...category,
            id: category.cat_id,
        }));
        res.set({
            "Access-Control-Expose-Headers": "Content-Range",
            "Content-Range": `X-Total-Count: ${1} - ${categories.length} / ${
                categories.length
            }`,
        });
        return res.status(200).json(updatedCategories);
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
        const updatedCategory = { ...category, id: category.cat_id };
        return res.status(200).json(updatedCategory);
    } catch (error) {
        return res.status(404).json({ error: "Category not found" });
    }
};

const getStoresByName = async (req: Request, res: Response) => {
    const stores = await getRepository(Store).find({
        where: { name: ILike(`%${req.query.name}%`) },
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
        console.log(error);
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
            where: { cat_id: Number(req.params.id) },
        });
        if (category) {
            await getRepository(StoreCategory).remove(category);
            return res
                .status(204)
                .json({ message: "Category has been deleted successfully" });
        }
    } catch (err) {
        console.log(err);
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
