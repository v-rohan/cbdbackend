import { Request, Response } from "express";
import { getRepository } from "typeorm";
import { Coupon } from "../entity/Coupon";
import { CouponCategory } from "../entity/CouponCategory";

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

const getCouponCategories = async (req: Request, res: Response) => {
    try {
        const couponCategories = await getRepository(CouponCategory).find();
        return res.status(200).json(couponCategories);
    } catch (err) {
        return res.status(400).json(err);
    }
};

const getCouponCategoryById = async (req: Request, res: Response) => {
    try {
        const couponCategory = await getRepository(
            CouponCategory
        ).findOneOrFail({
            where: { id: Number(req.params.id) },
            relations: ["coupons"],
        });
        return res.status(200).json(couponCategory);
    } catch (err) {
        res.status(400).json(err);
    }
};

const createCouponCategory = async (req: Request, res: Response) => {
    try {
        let couponCategory = new CouponCategory();
        couponCategory = { ...req.body };
        await getRepository(CouponCategory).save(couponCategory);
        return res.status(201).json(couponCategory);
    } catch (err) {
        res.status(400).json(err);
    }
};

const updateCouponCategory = async (req: Request, res: Response) => {
    try {
        const couponCategory = await getRepository(
            CouponCategory
        ).findOneOrFail({
            where: { id: Number(req.params.id) },
        });
        if (couponCategory) {
            getRepository(CouponCategory).merge(couponCategory, {
                ...req.body,
            });
        }
        const updatedCouponCategory = await getRepository(CouponCategory).save(
            couponCategory
        );
        return res.status(200).json(updatedCouponCategory);
    } catch (err) {
        return res.status(400).json(err);
    }
};

const deleteCouponCategory = async (req: Request, res: Response) => {
    try {
        const couponCategory = await getRepository(
            CouponCategory
        ).findOneOrFail({
            where: { id: Number(req.params.id) },
        });
        await getRepository(CouponCategory).remove(couponCategory);
        return res
            .status(204)
            .json({ message: "Coupon category has been deleted successfully" });
    } catch (err) {
        return res.status(400).json(err);
    }
};

export {
    getCoupons,
    createCoupon,
    getCouponById,
    updateCoupon,
    deleteCoupon,
    getCouponCategories,
    getCouponCategoryById,
    createCouponCategory,
    updateCouponCategory,
    deleteCouponCategory,
};
