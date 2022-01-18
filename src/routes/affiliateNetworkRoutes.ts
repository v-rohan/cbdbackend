import { Router } from "express";
import {
  createNetwork,
  getAllNetworks,
  getNetworkById,
  updateNetworkById,
  deleteNetworkById,
} from "../controller/AffiliateNetworkController";

const router: Router = Router();

router.get("/networks", getAllNetworks);
router.get("/networks/:id", getNetworkById);
router.post("/networks", createNetwork);
router.put("/networks/:id", updateNetworkById);
router.delete("/networks/:id", deleteNetworkById);

export default router;
