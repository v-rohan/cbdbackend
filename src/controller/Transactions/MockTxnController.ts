import * as fs from "fs";
import * as path from "path";
import { NextFunction, Request, Response } from "express";
import { getRepository } from "typeorm";
import { parseStream } from "fast-csv";
import { MockTxn } from "../../entity/Transactions/MockTxn";


const mockTxnRowProcessor = (row: Object) => {
    return {
        networkId: row['network_id'],
        networkCampId: row['network_campaign_id'],
        txnId: row['transaction_id'],
        commissionId: row['commission_id'],
        orderId: row['order_id'],
        saleDate: row['sale_date'].split("-").reverse().join("-"),
        saleAmount: Number(row['sale_amount']),
        baseCommission: Number(row['base_commission']),
        currency: row['currency'],
        status: row['status'],
        affSub1: row['aff_sub1'],
        affSub2: row['aff_sub2'],
        affSub3: row['aff_sub3'],
        affSub4: row['aff_sub4'],
        affSub5: row['aff_sub5'],
        exInfo: row['extra_information'],
    };
}

const csvProcessor = (filePath: string) => {
    return new Promise((resolve, reject) => {
        var data = [];
        const stream = fs.createReadStream(path.resolve(filePath));

        parseStream(stream, { headers: true })
            .on('error', error => console.error(error))
            .on('data', async (row) => {
                try {
                    // Delete rows that are given by the database
                    delete row['id'];
                    delete row['created_at'];
                    delete row['updated_at'];
                } catch (err) { ; }
                data.push(mockTxnRowProcessor(row));
            })
            .on('end', () => {
                // delete the file
                fs.unlink(filePath, (err) => {
                    if (err) {
                        console.log(err);
                    }
                });
                resolve(data);
            });
    })
}

const getMockTxns = async (request: Request, response: Response, next: NextFunction) => {
    var txns = await getRepository(MockTxn).find({ relations: ["networkId"] });
    response.status(200).json(txns);
}

const postMockTxns = async (request: Request, response: Response, next: NextFunction) => {
    var newTxn = request.body;
    try {
        await getRepository(MockTxn).save(newTxn);
    } catch (err) {
        response.status(400).json(err);
    }
    response.status(201).json(newTxn);
}

const mockTxnUploadCsv = async (request: Request, response: Response, next: NextFunction) => {
    var data: any = await csvProcessor(request.file.path);
    var errorLog = [];
    for (var i = 0; i < data.length; i++) {
        try {
            await getRepository(MockTxn).save(data[i]);
        } catch (err) {
            errorLog.push(`${i + 2}`);
        }
    }
    if (errorLog.length > 0) {
        response.status(200).json({
            error: `Error at lines: ${errorLog}`
        });
    } else {
        response.status(200).json({});
    }
}

const getMockTxn = async (request: Request, response: Response, next: NextFunction) => {
    var txn = await getRepository(MockTxn).findOne(
        request.params.id,
        { relations: ["networkId"] }
    );
    response.status(200).json(txn);
}

const postMockTxn = async (request: Request, response: Response, next: NextFunction) => {
    const MockTxnRepo = getRepository(MockTxn);
    var txn = await MockTxnRepo.findOne(request.params.id);
    txn = { ...txn, ...request.body };
    try {
        await MockTxnRepo.save(txn);
    } catch (err) {
        response.status(400).json(err);
    }
    response.status(201).json(txn);
}

const deleteMockTxn = async (request: Request, response: Response, next: NextFunction) => {
    await getRepository(MockTxn).delete(request.params.id);
    response.status(204).send();
}

export {
    getMockTxns,
    postMockTxns,
    mockTxnUploadCsv,
    getMockTxn,
    postMockTxn,
    deleteMockTxn,
}