import * as fs from "fs";
import * as path from "path";
import { NextFunction, Request, Response } from "express";
import { getRepository } from "typeorm";
import { parseStream } from "fast-csv";
import { MockTxn } from "../../entity/Transactions/MockTxn";
import { AffiliateNetwork } from "../../entity/AffiliateNetwork";
import MigrateMockTxns from "../../tasks/migrateMockTxns";
import { IGetUserAuthInfoRequest } from "../../types";

const mockTxnRowProcessor = (row: Object) => {
    // let networkId = await getRepository(AffiliateNetwork).findOne({ where: { name: row['network_id'] } });
    return {
        ...row,
        // network_id: networkId.id,
        sale_date: row["sale_date"].split("-").reverse().join("-"),
    };
};

const csvProcessor = (filePath: string) => {
    return new Promise((resolve, reject) => {
        var data = [];
        const stream = fs.createReadStream(path.resolve(filePath));

        parseStream(stream, { headers: true })
            .on("error", (error) => console.error(error))
            .on("data", async (row) => {
                try {
                    // Delete rows that are given by the database
                    delete row["id"];
                    delete row["created_at"];
                    delete row["updated_at"];
                } catch (err) {}
                data.push(mockTxnRowProcessor(row));
            })
            .on("end", () => {
                // delete the file
                fs.unlink(filePath, (err) => {
                    if (err) {
                        console.log(err);
                    }
                });
                resolve(data);
            });
    });
};

const getMockTxns = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    var txns = await getRepository(MockTxn).find({ relations: ["network_id"] });
    res.set({
        "Access-Control-Expose-Headers": "Content-Range",
        "Content-Range": `X-Total-Count: ${1} - ${txns.length} / ${
            txns.length
        }`,
    })
    res.status(200).json(txns);
};

const postMockTxns = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    var newTxn = req.body;
    try {
        await getRepository(MockTxn).save(newTxn);
    } catch (err) {
        res.status(400).json(err);
    }
    res.status(201).json(newTxn);
};

const mockTxnUploadCsv = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    console.log(req.body.csv);
    csvProcessor(req.file.path).then(async (data: Array<Object>) => {
        const MockTxnRepo = getRepository(MockTxn);
        var errorLog = [];
        for (var i = 0; i < data.length; i++) {
            try {
                let txn: Array<MockTxn> = await MockTxnRepo.find({
                    where: {
                        aff_sub1: data[i]["aff_sub1"],
                        transaction_id: data[i]["transaction_id"],
                    },
                });
                let network = await getRepository(AffiliateNetwork).findOneOrFail({
                    where: { name: data[i]["network_id"] },
                });
                data[i]["network_id"] = network.id;
                let status = network.sale_statuses;
                for (var key in status) {
                    if (status[key] == data[i]["status"]) {
                        data[i]["status"] = key;
                    }
                }
                var newTxn: MockTxn = new MockTxn();
                if (txn.length === 1)
                    newTxn = { ...newTxn, ...txn[0], ...data[i] };
                else newTxn = { ...newTxn, ...data[i] };
                await MockTxnRepo.save(newTxn);
            } catch (err) {
                errorLog.push(`${i + 2}`);
            }
        }
        if (errorLog.length > 0) {
            res.status(200).json({
                error: `Error at lines: ${errorLog}`,
            });
        } else {
            res.status(200).json({});
        }
    });
};

const getMockTxn = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    var txn = await getRepository(MockTxn).findOne(req.params.id, {
        relations: ["network_id"],
    });
    res.status(200).json(txn);
};

const postMockTxn = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const MockTxnRepo = getRepository(MockTxn);
    var txn = await MockTxnRepo.findOne(req.params.id);
    txn = { ...txn, ...req.body };
    try {
        await MockTxnRepo.save(txn);
    } catch (err) {
        res.status(400).json(err);
    }
    res.status(201).json(txn);
};

const deleteMockTxn = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    await getRepository(MockTxn).delete(req.params.id);
    res.status(204).send();
};

const putMockTxn = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    var mock = await getRepository(MockTxn).findOneOrFail(req.params.id);
    mock = { ...mock, ...req.body };
    try {
        await getRepository(MockTxn).save(mock);
    } catch (err) {
        res.status(400).json(err);
    }
    res.status(200).json(mock);
}

const transferMockTxns = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        await MigrateMockTxns();
        res.status(200);
    } catch (err) {
        res.status(400).json(err);
    }
};

const migrateMockTxns = async (req: IGetUserAuthInfoRequest, res: Response) => {
    MigrateMockTxns().then((data) => {
        if (data === 1) {
            res.status(200).json({"message": "OK"});
        } else {
            res.status(500).json({"message": "NOT OK"});
        }
    })
}

export {
    getMockTxns,
    postMockTxns,
    mockTxnUploadCsv,
    getMockTxn,
    postMockTxn,
    deleteMockTxn,
    putMockTxn,
    transferMockTxns,
    migrateMockTxns,
};
