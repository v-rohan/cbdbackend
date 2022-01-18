import { Request, Response } from "express";
import { getRepository } from "typeorm";
import { AffiliateNetwork } from "../entity/AffiliateNetwork";

export class AffiliateNetworkController {
  private networkRepository = getRepository(AffiliateNetwork);

  async getAllNetworks(req: Request, res: Response) {
    const networks = await this.networkRepository.find();
    return networks;
  }

  async getNetworkById(req: Request, res: Response) {
    try {
      const network = await this.networkRepository.findOneOrFail({
        where: { id: Number(req.params.id) },
      });
      return network;
    } catch (error) {
      return { error };
    }
  }

  async createNetwork(req: Request, res: Response) {
    try {
      let network = new AffiliateNetwork();
      network = { ...req.body };
      await this.networkRepository.save(network);
      return network;
    } catch (error) {
      return { error };
    }
  }

  async updateNetworkById(req: Request, res: Response) {
    try {
      const network = await this.networkRepository.findOne({
        where: { id: Number(req.params.id) },
      });
      if (network) {
        this.networkRepository.merge(network, { ...req.body });
        const updatedNetwork = await this.networkRepository.save(network);
        return updatedNetwork;
      }
    } catch (err) {
      return err;
    }
  }

  async deleteNetworkById(req: Request, res: Response) {
    try {
      const network = await this.networkRepository.findOneOrFail({
        where: { id: Number(req.params.id) },
      });
      await this.networkRepository.remove(network);
      return { res: "Network has been deleted successfully" };
    } catch (err) {
      return { err };
    }
  }
}
