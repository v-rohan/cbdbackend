import { Response } from "express";
import { getRepository } from "typeorm";
import { Mode, PaymentMode } from "../entity/Payment/PaymentMode";
import { PayoutRequest, StatusOpts } from "../entity/Payment/PayoutRequest";
import { IGetUserAuthInfoRequest } from "../types";

import fetch from "node-fetch";
import { publishMail } from "../tasks/publishMail";
const Paytm = require("paytmchecksum");

const bulkTransfer = async (req: IGetUserAuthInfoRequest, res: Response) => {
    const payoutRequestIds = req.body.ids;
    const PayoutReqRepo = getRepository(PayoutRequest);
    payoutRequestIds.forEach(async (id) => {
        const payoutRequest: PayoutRequest = await PayoutReqRepo.findOne({
            where: { id: Number(id) },
            relations: ["payment_mode", "user_id"],
        });
        if (payoutRequest.status === "completed") {
            return;
        }
        // Make PAYTM API Call
        let paytmParams: any = {
            subwalletGuid: process.env.PAYTM_SUBWALLET_GUID,
            orderId: payoutRequest.payment_id,
            amount: (+Number(payoutRequest.cashback_amount)) + Number(payoutRequest.reward_amount),
        };
        var path: string;
        if (payoutRequest.status !== StatusOpts.created) {
            path = `/bpay/api/v1/disburse/order/query`;
            paytmParams = {
                orderId: payoutRequest.payment_id
            }
        } else if (payoutRequest.payment_mode.method_code === Mode.paytm) {
            // Make PAYTM WALLET TRANSFER call
            paytmParams = {
                ...paytmParams,
                beneficiaryPhoneNo: payoutRequest.payment_mode.account,
            };
            path = `/bpay/api/v1/disburse/order/wallet/${process.env.PAYTM_SOLUTION}`;
        } else {
            // Make PAYTM BANK TRANSFER call
            paytmParams = {
                ...paytmParams,
                beneficiaryAccount: payoutRequest.payment_mode.account,
                beneficiaryIFSC: payoutRequest.payment_mode.inputs["ifsc_code"],
                purpose: "OTHERS",
            };
            path = "/bpay/api/v1/disburse/order/bank";
        }
        var post_data = JSON.stringify(paytmParams);

        const x_checksum = await Paytm.generateSignature(
            post_data,
            process.env.PAYTM_MERCHANT_KEY
        );
        var x_mid = process.env.PAYTM_MID;

        const response = await fetch(`${process.env.PAYTM_HOST}${path}`, {
            method: "POST",
            body: post_data,
            headers: {
                "Content-Type": "application/json",
                "x-mid": x_mid,
                "x-checksum": x_checksum,
                "Content-Length": post_data.length.toString(),
            },
        });
        const api_response = (await response.json()) as {
            status: string;
            statusCode: string;
            statusMessage: string;
        };
        console.log(api_response);
        payoutRequest.api_response = api_response;
        payoutRequest.api_status = api_response.status;
        payoutRequest.note = api_response.statusMessage;
        if (
            api_response.status === "FAILURE" ||
            api_response.status === "CANCELLED"
        ) {
            payoutRequest.status = StatusOpts.declined;
        } else if (api_response.status === "SUCCESS") {
            payoutRequest.status = StatusOpts.completed;
            payoutRequest.paid_at = (new Date()).toISOString();
        } else {
            payoutRequest.status = StatusOpts.processing;
        }
        await PayoutReqRepo.save(payoutRequest);
        publishMail({
            template: 'payoutUpdate',
            message: {
                to: payoutRequest.user_id.email.toString(),
            },
            locals: {
                pid: payoutRequest.payment_id,
                note: payoutRequest.note,
                date: payoutRequest.paid_at,
            },
        })
    });
    return res.status(200).json({
        success: true,
        message: "Payout Request(s) updated successfully",
    });
};

const getPayoutRequests = async (
    req: IGetUserAuthInfoRequest,
    res: Response
) => {
    try {
        const payoutRequests: PayoutRequest[] = await getRepository(
            PayoutRequest
        ).find({
            relations: ["payment_mode", "user_id"],
        });
        res.set({
            "Access-Control-Expose-Headers": "Content-Range",
            "Content-Range": `X-Total-Count: ${1} - ${
                payoutRequests.length
            } / ${payoutRequests.length}`,
        });
        return res.status(200).json(payoutRequests);
    } catch (err) {
        console.log(err);
        return res.json(400).json({ err });
    }
};

const getPayoutRequestById = async (
    req: IGetUserAuthInfoRequest,
    res: Response
) => {
    try {
        const payoutRequestId = req.params.id;
        const payoutRequest: PayoutRequest = await getRepository(
            PayoutRequest
        ).findOneOrFail({
            where: { id: Number(payoutRequestId) },
            relations: ["payment_mode", "user_id"],
        });
        return res.status(200).json(payoutRequest);
    } catch (err) {
        return res.status(500);
    }
};

const updatePayoutRequestById = async (
    req: IGetUserAuthInfoRequest,
    res: Response
) => {
    const payoutRequestId = req.params.id;
    const PayoutReqRepo = getRepository(PayoutRequest);
    try {
        var payoutRequest: PayoutRequest = await PayoutReqRepo.findOneOrFail({
            where: { id: Number(payoutRequestId) },
        });
        PayoutReqRepo.merge(payoutRequest, { ...req.body });
        const updatedPayoutRequest = await PayoutReqRepo.save(payoutRequest);
        return res.status(200).json(updatedPayoutRequest);
    } catch (err) {
        return res.status(500);
    }
};

const deletePayoutRequestById = async (
    req: IGetUserAuthInfoRequest,
    res: Response
) => {
    try {
        const payoutRequest: PayoutRequest = await getRepository(
            PayoutRequest
        ).findOneOrFail({ where: { id: Number(req.params.id) } });
        await getRepository(PayoutRequest).remove(payoutRequest);
        return res
            .status(204)
            .json({ message: "Payout Request Deleted Successfully" });
    } catch (error) {
        return res.status(400).json({ error });
    }
};

const getBankPayouts = async (req: IGetUserAuthInfoRequest, res: Response) => {
    const payoutRequests: PayoutRequest[] = await getRepository(
        PayoutRequest
    ).find({
        where: {
            payment_mode: { method_code: Mode.bank },
        },
        relations: ["payment_mode", "user_id"],
    });
    res.set({
        "Access-Control-Expose-Headers": "Content-Range",
        "Content-Range": `X-Total-Count: ${1} - ${payoutRequests.length} / ${
            payoutRequests.length
        }`,
    });
    return res.status(200).json(payoutRequests);
};

const getPaytmWalletPayouts = async (
    req: IGetUserAuthInfoRequest,
    res: Response
) => {
    try {
        const paytmWalletPayouts: Array<PayoutRequest> = await getRepository(
            PayoutRequest
        ).find({
            where: {
                payment_mode: { method_code: Mode.paytm },
            },
            relations: ["payment_mode", "user_id"],
        });
        res.set({
            "Access-Control-Expose-Headers": "Content-Range",
            "Content-Range": `X-Total-Count: ${1} - ${
                paytmWalletPayouts.length
            } / ${paytmWalletPayouts.length}`,
        });
        return res.status(200).json(paytmWalletPayouts);
    } catch (err) {
        console.log(err);
        res.status(400).json({ err });
    }
};

export {
    bulkTransfer,
    getPayoutRequests,
    getPayoutRequestById,
    updatePayoutRequestById,
    deletePayoutRequestById,
    getBankPayouts,
    getPaytmWalletPayouts,
};
