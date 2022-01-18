import { Request, Response } from "express";
import { getRepository } from "typeorm";
import { AffiliateNetwork } from "../entity/AffiliateNetwork";

const getAllNetworks = async (req: Request, res: Response) => {
  const networks = await getRepository(AffiliateNetwork).find();
  return res.status(200).json(networks);
};

const getNetworkById = async (req: Request, res: Response) => {
  try {
    const network = await getRepository(AffiliateNetwork).findOneOrFail({
      where: { id: Number(req.params.id) },
    });
    return res.status(200).json(network);
  } catch (error) {
    return res.status(404).json({ error: "Affiliate Network not found" });
  }
};

const createNetwork = async (req: Request, res: Response) => {
  try {
    let network = new AffiliateNetwork();
    network = { ...req.body };
    await getRepository(AffiliateNetwork).save(network);
    return res.status(201).json(network);
  } catch (error) {
    return res.status(400).json(error);
  }
};

const updateNetworkById = async (req: Request, res: Response) => {
  try {
    const network = await getRepository(AffiliateNetwork).findOne({
      where: { id: Number(req.params.id) },
    });
    if (network) {
      getRepository(AffiliateNetwork).merge(network, { ...req.body });
      const updatedNetwork = await getRepository(AffiliateNetwork).save(
        network
      );
      return res.status(200).json(updatedNetwork);
    }
  } catch (err) {
    return res.status(400).json(err);
  }
};

const deleteNetworkById = async (req: Request, res: Response) => {
  try {
    const network = await getRepository(AffiliateNetwork).findOneOrFail({
      where: { id: Number(req.params.id) },
    });
    await getRepository(AffiliateNetwork).remove(network);
    return res
      .status(204)
      .json({ message: "Network has been deleted successfully" });
  } catch (err) {
    return res.status(400).json(err);
  }
};

export {
  getAllNetworks,
  getNetworkById,
  createNetwork,
  updateNetworkById,
  deleteNetworkById,
};
