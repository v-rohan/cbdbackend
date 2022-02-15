import { Request, Response } from "express";
import { getRepository } from "typeorm";
import { Coupon } from "../entity/Coupon";

const getCoupons = async (req: Request, res: Response) => {
    try {
        const coupon = await getRepository(Coupon).find({
            relations: ["categories", "store_id", "network_id"],
        });
        return res.status(200).json(coupon);
    } catch (error) {
        return res.status(400).json(error);
    }
};

const createCoupon = async (req: Request, res: Response) => {
    try {
        let coupon = new Coupon();
        coupon = { ...req.body };
        await getRepository(Coupon).save(coupon);
        return res.status(201).json(coupon);
    } catch (error) {
        return res.status(400).json(error);
    }
};

const getCouponById = async (req: Request, res: Response) => {
    try {
        const coupon = await getRepository(Coupon).findOneOrFail({
            where: { id: Number(req.params.id) },
        });
        return res.status(200).json(coupon);
    } catch (error) {
        return res.status(400).json(error);
    }
};

const updateCoupon = async (req: Request, res: Response) => {
    try {
        const coupon = await getRepository(Coupon).findOneOrFail({
            where: { id: Number(req.params.id) },
        });
        if (coupon) {
            getRepository(Coupon).merge(coupon, { ...req.body });
            const updatedCoupon = await getRepository(Coupon).save(coupon);
            return res.status(200).json(updatedCoupon);
        }
    } catch (err) {
        return res.status(400).json(err);
    }
};

const deleteCoupon = async (req: Request, res: Response) => {
    try {
        const coupon = await getRepository(Coupon).findOneOrFail({
            where: { id: Number(req.params.id) },
        });
        await getRepository(Coupon).remove(coupon);
        return res
            .status(204)
            .json({ message: "Coupon has been deleted successfully" });
    } catch (err) {
        return res.status(400).json(err);
    }
};

export { getCoupons, createCoupon, getCouponById, updateCoupon, deleteCoupon };
