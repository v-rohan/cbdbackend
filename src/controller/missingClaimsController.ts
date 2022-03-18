import { Response } from "express";
import { getRepository } from "typeorm";
import { MissingClaim } from "../entity/MissingClaim";
import { CashbackTxn } from "../entity/Transactions/CashbackTxn";
import { IGetUserAuthInfoRequest } from "../types";

const getAllClaims = async (req: IGetUserAuthInfoRequest, res: Response) => {
    const claims = await getRepository(MissingClaim).find();
    res.set({
        "Access-Control-Expose-Headers": "Content-Range",
        "Content-Range": `X-Total-Count: ${1} - ${claims.length} / ${
            claims.length
        }`,
    });
    return res.status(200).json({ claims });
};

const getClaimById = async (req: IGetUserAuthInfoRequest, res: Response) => {
    try {
        const claim = getRepository(MissingClaim).findOneOrFail({
            where: { id: Number(req.params.id) },
        });
        return res.status(200).json({ claim });
    } catch (error) {
        res.status(400).json({ error });
    }
};

const getClaimByUser = async (req: IGetUserAuthInfoRequest, res: Response) => {
    const claims = await getRepository(MissingClaim).find({
        where: { user: { id: req.user.id } },
    });
    return res.status(200).json({ claims });
};

const submitClaim = async (req: IGetUserAuthInfoRequest, res: Response) => {
    const cashbackTxnId = req.body.cashbackTxnId;
    try {
        const cashbackTxn = await getRepository(CashbackTxn).findOneOrFail({
            where: { id: cashbackTxnId },
            relations: ["user", "network_id", "store", "click_id"],
        });

        const newClaim: MissingClaim = new MissingClaim();
        newClaim.user_id = req.user;
        newClaim.click_id = cashbackTxn.click_id;
        newClaim.store_id = cashbackTxn.store;
        newClaim.network_id = cashbackTxn.network_id;
        newClaim.click_time = cashbackTxn.click_id.createdAt;
        newClaim.order_id = cashbackTxn.order_id;
        newClaim.currency_iso = cashbackTxn.currency;
        newClaim.order_amount = cashbackTxn.sale_amount;
        newClaim.transaction_date = cashbackTxn.txn_date_time;
        newClaim.platform = req.body.platform;
        newClaim.user_message = req.body.message;

        await getRepository(MissingClaim).save(newClaim);
    } catch (error) {
        res.status(404).json({ message: "Cashback Transaction not found" });
    }
};

const updateClaimStaus = async (
    req: IGetUserAuthInfoRequest,
    res: Response
) => {
    try {
        const claim = await getRepository(MissingClaim).findOneOrFail({
            where: { id: req.params.id },
        });
    } catch (error) {}
};

export {
    getAllClaims,
    getClaimById,
    getClaimByUser,
    submitClaim,
    updateClaimStaus,
};
