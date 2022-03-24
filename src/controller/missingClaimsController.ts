import { Response } from "express";
import { getRepository } from "typeorm";
import { MissingClaim, MissingClaimStatus } from "../entity/MissingClaim";
import { CashbackTxn } from "../entity/Transactions/CashbackTxn";
import { publishMail } from "../tasks/publishMail";
import { IGetUserAuthInfoRequest } from "../types";

const getAllClaims = async (req: IGetUserAuthInfoRequest, res: Response) => {
    const claims = await getRepository(MissingClaim).find({
        relations: ["user_id", "click_id", "store_id", "network_id"]
    });
    res.set({
        "Access-Control-Expose-Headers": "Content-Range",
        "Content-Range": `X-Total-Count: ${1} - ${claims.length} / ${
            claims.length
        }`,
    });
    return res.status(200).send(claims);
};

const getClaimById = async (req: IGetUserAuthInfoRequest, res: Response) => {
    try {
        const claim = getRepository(MissingClaim).findOneOrFail({
            where: { id: Number(req.params.id) },
            relations: ["user_id", "click_id", "store_id", "network_id"]
        });
        return res.status(200).json(claim);
    } catch (error) {
        res.status(400).json({ error });
    }
};

const getClaimByUser = async (req: IGetUserAuthInfoRequest, res: Response) => {
    const claims = await getRepository(MissingClaim).find({
        where: { user_id: { id: req.user.id } },
        relations: ["user_id", "click_id", "store_id", "network_id"]
    });
    return res.status(200).json(claims);
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
        newClaim.image = req.file.path;

        await getRepository(MissingClaim).save(newClaim);
        publishMail({
            template: 'claimCreated',
            message: {
                to: newClaim.user_id.email.toString(),
            },
            locals: {
                first_name: newClaim.user_id.first_name,
                last_name: newClaim.user_id.last_name,
                store: newClaim.store_id.name,
                date: (new Date()).toDateString(),
                cbtxnid: cashbackTxn.id,
                txnAmount: cashbackTxn.cashback,
            },
        })
        res.status(201).json({"message": "Missing Claim Created"});
    } catch (error) {
        res.status(404).json({ message: "Cashback Transaction not found" });
    }
};

const updateClaimStaus = async (
    req: IGetUserAuthInfoRequest,
    res: Response
) => {
    try {
        var claim = await getRepository(MissingClaim).findOneOrFail({
            where: { id: req.params.id },
            relations: ["user_id"]
        });
        var status = claim.status;
        claim = {...claim, ...req.body}
        await getRepository(MissingClaim).save(claim);
        if (claim.status != status) {
            publishMail({
                template: 'claimUpdate',
                message: {
                    to: claim.user_id.email.toString(),
                },
                locals: {
                    first_name: claim.user_id.first_name,
                    last_name: claim.user_id.last_name,
                    date: claim.updated_at,
                    status: claim.status.toUpperCase(),
                    note: claim.admin_note
                }
            })
        }
        return res.status(200).json({"message": "Updated Claim"})
    } catch (error) {}
};

export {
    getAllClaims,
    getClaimById,
    getClaimByUser,
    submitClaim,
    updateClaimStaus,
};
