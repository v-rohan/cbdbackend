import { Request, Response } from "express";
import { getRepository } from "typeorm";
import { Store } from "../entity/Store";

const getAllStores = async (req: Request, res: Response) => {
  const stores = await getRepository(Store).find();
  res.set({ 'Access-Control-Expose-Headers': 'Content-Range', 'Content-Range': `X-Total-Count: ${1} - ${stores.length} / ${stores.length}` });
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

export {
  getAllStores,
  getStoreById,
  createStore,
  updateStoreById,
  deleteStoreById,
};