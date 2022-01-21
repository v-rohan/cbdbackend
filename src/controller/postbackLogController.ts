import { Request, Response } from "express";
import { getRepository } from "typeorm";
import { PostbackLog } from "../entity/PostbackLog";

const getAllLogs = async (req: Request, res: Response) => {
  const logs = await getRepository(PostbackLog).find();
  return res.status(200).json(logs);
};

const createPostbackLog = async (req: Request, res: Response) => {
  try {
    let log = new PostbackLog();
    log = { ...req.body };
    await getRepository(PostbackLog).save(log);
    return res.status(201).json(log);
  } catch (error) {
    return res.status(400).json(error);
  }
};

const getLogById = async (req: Request, res: Response) => {
  try {
    const log = await getRepository(PostbackLog).findOneOrFail({
      where: { id: Number(req.params.id) },
      relations: ["affiliateNetwork"],
    });
    return res.status(200).json(log);
  } catch (error) {
    return res.status(404).json({ error: "Postback Log not found" });
  }
};

const getLogsByNetworkId = async (req: Request, res: Response) => {
  try {
    const logs = await getRepository(PostbackLog).find({
      where: { affiliateNetwork: Number(req.params.id) },
    });
    return res.status(200).json(logs);
  } catch (error) {
    return res.status(400).json({ error });
  }
};

const updateLogById = async (req: Request, res: Response) => {
  try {
    const log = await getRepository(PostbackLog).findOneOrFail({
      where: { id: Number(req.params.id) },
    });
    if (log) {
      getRepository(PostbackLog).merge(log, { ...req.body });
      const updatedNetwork = await getRepository(PostbackLog).save(log);
      return res.status(200).json(updatedNetwork);
    }
  } catch (err) {
    return res.status(400).json(err);
  }
};

const deleteLogById = async (req: Request, res: Response) => {
  try {
    const log = await getRepository(PostbackLog).findOneOrFail({
      where: { id: Number(req.params.id) },
    });
    await getRepository(PostbackLog).remove(log);
    return res
      .status(204)
      .json({ message: "Postback Log has been deleted successfully" });
  } catch (err) {
    return res.status(400).json(err);
  }
};

export {
  getAllLogs,
  createPostbackLog,
  getLogById,
  getLogsByNetworkId,
  updateLogById,
  deleteLogById,
};
