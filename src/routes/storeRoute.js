import { Router } from "express";
import { addStore, getStores } from "../controllers/storeController";

const router = new Router();

router.get("/", getStores);
router.post("/", addStore);

export default router;
