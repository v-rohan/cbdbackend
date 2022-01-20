import * as fs from "fs";
import * as path from "path";
import { NextFunction, Request, Response, Express } from "express";
import { getRepository } from "typeorm";
import * as express from "express";
import { parseStream } from "fast-csv";
import multer = require("multer");
import { BonusTxn, CashbackTxn, MockTxn, ReferrerTxns, SalesTxn } from "../entity/CashbackTxn";
import { IGetUserAuthInfoRequest } from "./userRoutes";

module.exports = (app: Express, passport: any) => {

    require("../passport/jwt")(passport);
    require("../passport/google")(passport);


    var router = express.Router();

    const adminCheck = (request: IGetUserAuthInfoRequest, response: Response, next: NextFunction) => {
        console.log(request.user);
        if(request.isAuthenticated() && request.user.role === "admin") {
            next();
        } else {
            response.status(401).send('Unauthorized');
        }
    };

    router.use(passport.authenticate('jwt', { session: false }));
    router.use(adminCheck);

    const storage = multer.diskStorage({
        destination: (request: Request, file: any, cb: any) => {
            cb(null, './mockTxns/')
        },
        filename: (request: Request, file: any, cb: any) => {
            const suffix = Date.now();
            console.log(file);
            cb(
                null,
                (
                    file.originalname
                    .substring(0, file.originalname.length - 4)
                    + '-' + suffix + '.csv'
                )
            )
        }
    })
    const upload = multer({ storage: storage })


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
            const MockTxnRepo = getRepository(MockTxn);
            var errorLog = [];
            var rowCnt = 0;
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
                    } catch (err) {;}
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

    // MockTxn Routes
    router.route('/mock')
    .get(async (request: Request, response: Response, next: NextFunction) => {
        var txns = await getRepository(MockTxn).find();
        response.status(200).json(txns);
    })
    .post(async (request: Request, response: Response, next: NextFunction) => {
        var newTxn = request.body;
        await getRepository(MockTxn).save(newTxn);
        response.status(201).json(newTxn);
    })


    router.post('/mockUpload', upload.single('csv'), async (request: Request, response: Response, next: NextFunction) => {
    var data: any = await csvProcessor(request.file.path);
    var errorLog = [];
    for (var i = 0; i < data.length; i++) {
        try {
            await getRepository(MockTxn).save(data[i]);
        } catch (err) {
            errorLog.push(`${i + 2}`);
        }
    }
    if(errorLog.length > 0) {
        response.status(200).json({
            error: `Error at lines: ${errorLog}`
        });
    } else {
        response.status(200).json({});
    }
    })


    router.route('/mock/:id')
    .get(async (request: Request, response: Response, next: NextFunction) => {
        var txn = await getRepository(MockTxn).findOne(request.params.id);
        response.status(200).json(txn);
    })
    .post(async (request: Request, response: Response, next: NextFunction) => {
        const MockTxnRepo = getRepository(MockTxn);
        var txn = await MockTxnRepo.findOne(request.params.id);
        txn.networkId = request.body.networkId;
        txn.networkCampId = request.body.networkCampId;
        txn.txnId = request.body.txnId;
        txn.commissionId = request.body.commissionId;
        txn.orderId = request.body.orderId;
        txn.saleAmount = request.body.saleAmount;
        txn.saleDate = request.body.saleDate;
        txn.baseCommission = request.body.baseCommission;
        txn.currency = request.body.currency;
        txn.status = request.body.status;
        txn.affSub1 = request.body.affSub1;
        txn.affSub2 = request.body.affSub2;
        txn.affSub3 = request.body.affSub3;
        txn.affSub4 = request.body.affSub4;
        txn.affSub5 = request.body.affSub5; 
        txn.exInfo = request.body.exInfo;
        await MockTxnRepo.save(txn);
        response.status(201).json(txn);
    })
    .delete(async (request: Request, response: Response, next: NextFunction) => {
        await getRepository(MockTxn).delete(request.params.id);
        response.status(204).send();
    })


    // SalesTxn Routes
    router.route('sales')
    .get(async (request: Request, response: Response, next: NextFunction) => {
        var txns = await getRepository(SalesTxn).find();
        response.status(200).json(txns);
    })
    .post(async (request: Request, response: Response, next: NextFunction) => {
        var newTxn = request.body;
        await getRepository(SalesTxn).save(newTxn);
        response.status(201).json(newTxn);
    })


    router.route('sales/:id')
    .get(async (request: Request, response: Response, next: NextFunction) => {
        var txn = await getRepository(SalesTxn).findOne(request.params.id);
        response.status(200).json(txn);
    })
    .post(async (request: Request, response: Response, next: NextFunction) => {
        var txn = await getRepository(SalesTxn).findOne(request.params.id);
        txn.networkId = request.body.networkId;
        txn.networkCampId = request.body.networkCampId;
        txn.txnId = request.body.txnId;
        txn.commissionId = request.body.commissionId;
        txn.orderId = request.body.orderId;
        txn.clickDate = request.body.clickDate;
        txn.saleDate = request.body.saleDate;
        txn.saleAmount = request.body.saleAmount;
        txn.baseCommission = request.body.baseCommission;
        txn.saleUpdTime = request.body.saleUpdTime;
        txn.currency = request.body.currency;
        txn.status = request.body.status;
        txn.affSub1 = request.body.affSub1;
        txn.affSub2 = request.body.affSub2;
        txn.affSub3 = request.body.affSub3;
        txn.affSub4 = request.body.affSub4;
        txn.affSub5 = request.body.affSub5;
        txn.batchId = request.body.batchId;
        txn.exInfo = request.body.exInfo;
        await getRepository(SalesTxn).save(txn);
        response.status(201).json(txn);
    })
    .delete(async (request: Request, response: Response, next: NextFunction) => {
        await getRepository(SalesTxn).delete(request.params.id);
        response.status(204).send();
    })


    // CashbackTxn Routes
    router.route('/cashback')
    .get(async (request: Request, response: Response, next: NextFunction) => {
        var txns = await getRepository(CashbackTxn).find();
        response.status(200).json(txns);
    })
    .post(async (request: Request, response: Response, next: NextFunction) => {
        var newTxn = request.body;
        await getRepository(CashbackTxn).save(newTxn);
        response.status(201).json(newTxn);
    })


    router.route('/cashback/:id')
    .get(async (request: Request, response: Response, next: NextFunction) => {
        var txn = await getRepository(CashbackTxn).findOne(request.params.id);
        response.status(200).json(txn);
    })
    .post(async (request: Request, response: Response, next: NextFunction) => {
        var txn = await getRepository(CashbackTxn).findOne(request.params.id);
        txn.saleId = request.body.saleId;
        txn.networkId = request.body.networkId;
        txn.orderId = request.body.orderId;
        txn.store = request.body.store;
        txn.clickId = request.body.clickId;
        txn.saleAmount = request.body.saleAmount;
        txn.cashback = request.body.cashback;
        txn.currency = request.body.currency;
        txn.status = request.body.status;
        txn.txnDateTime = request.body.txnDateTime;
        txn.mailSent = request.body.mailSent;
        await getRepository(CashbackTxn).save(txn);
        response.status(201).json(txn);
    })
    .delete(async (request: Request, response: Response, next: NextFunction) => {
        await getRepository(CashbackTxn).delete(request.params.id);
        response.status(204).send();
    })


    // BonusTxn Routes
    router.route('/bonus')
    .get(async (request: Request, response: Response, next: NextFunction) => {
        var txns = await getRepository(BonusTxn).find();
        response.status(200).json(txns);
    })
    .post(async (request: Request, response: Response, next: NextFunction) => {
        var newTxn = request.body;
        await getRepository(BonusTxn).save(newTxn);
        response.status(201).json(newTxn);
    })


    router.route('/bonus/:id')
    .get(async (request: Request, response: Response, next: NextFunction) => {
        var txn = await getRepository(BonusTxn).findOne(request.params.id);
        response.status(200).json(txn);
    })
    .post(async (request: Request, response: Response, next: NextFunction) => {
        var txn = await getRepository(BonusTxn).findOne(request.params.id);
        txn.bonusCode = request.body.bonusCode;
        txn.amount = request.body.amount;
        txn.awardedOn = request.body.awardedOn;
        txn.expiresOn = request.body.expiresOn;
        txn.status = request.body.status;
        await getRepository(BonusTxn).save(txn);
        response.status(201).json(txn);
    })
    .delete(async (request: Request, response: Response, next: NextFunction) => {
        await getRepository(BonusTxn).delete(request.params.id);
        response.status(204).send();
    })


    // ReferrerTxns Routes
    router.route('/referrer')
    .get(async (request: Request, response: Response, next: NextFunction) => {
        var txns = await getRepository(ReferrerTxns).find();
        response.status(200).json(txns);
    })
    .post(async (request: Request, response: Response, next: NextFunction) => {
        var newTxn = request.body;
        await getRepository(ReferrerTxns).save(newTxn);
        response.status(201).json(newTxn);
    })


    router.route('/referrer/:id')
    .get(async (request: Request, response: Response, next: NextFunction) => {
        var txn = await getRepository(ReferrerTxns).findOne(request.params.id);
        response.status(200).json(txn);
    })
    .post(async (request: Request, response: Response, next: NextFunction) => {
        var txn = await getRepository(ReferrerTxns).findOne(request.params.id);
        txn.store = request.body.store;
        txn.refAmount = request.body.clickId;
        txn.saleAmount = request.body.saleAmount;
        txn.currency = request.body.currency;
        txn.status = request.body.status;
        txn.txnDateTime = request.body.txnDateTime;
        txn.mailSent = request.body.mailSent;
        await getRepository(ReferrerTxns).save(txn);
        response.status(201).json(txn);
    })
    .delete(async (request: Request, response: Response, next: NextFunction) => {
        await getRepository(ReferrerTxns).delete(request.params.id);
        response.status(204).send();
    })


    return router;

}
