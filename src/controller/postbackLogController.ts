import { Request, Response } from "express";
import { getRepository } from "typeorm";
import { PostbackLog } from "../entity/PostbackLog";
import { getManager } from "typeorm";
import { SalesTxn } from "../entity/Transactions/SalesTxn";
import { CashbackTxn } from "../entity/Transactions/CashbackTxn";
import { Clicks } from "../entity/Clicks";

const getAllLogs = async (req: Request, res: Response) => {
    const logs = await getRepository(PostbackLog).find();
    res.set({
        "Access-Control-Expose-Headers": "Content-Range",
        "Content-Range": `X-Total-Count: ${1} - ${logs.length} / ${
            logs.length
        }`,
    });
    return res.status(200).json(logs);
};

const createOrUpdatePostbackLog = async (req: Request, res: Response) => {
  try {

    let log: PostbackLog = await getRepository(PostbackLog).findOne({ aff_sub1: (req.query.aff_sub1) });
    if (!log)
      log = new PostbackLog();

    let salesTxn: SalesTxn = await getRepository(SalesTxn).findOne({ aff_sub1: String(req.query.aff_sub1) });
    if (!salesTxn)
      salesTxn = new SalesTxn();

    var click = await getRepository(Clicks).findOneOrFail({ where: {id: req.query.aff_sub1} });
    let cashbackTxn: CashbackTxn = await getRepository(CashbackTxn).findOne({ click_id: click });
    if (!cashbackTxn)
      cashbackTxn = new CashbackTxn();

    let dbObjects = []
    dbObjects.push(log, salesTxn, cashbackTxn)

    await getManager().transaction(async transactionalEntityManager => {
      log = { ...log, ...req.query };
      


      await transactionalEntityManager.save(log);

      Object.keys(salesTxn).filter(key => key in req.query).forEach(key => {
        salesTxn[key] = req.query[key]
      })

      salesTxn.commission_amount = salesTxn.base_commission

      await transactionalEntityManager.save(salesTxn);

      Object.keys(cashbackTxn).filter(key => key in req.query).forEach(key => {
        cashbackTxn[key] = req.query[key]
      })

      getRepository(Clicks).findOneOrFail({ id: Number(req.query.aff_sub1) }).then(click => {
        cashbackTxn.user = click.user;
        cashbackTxn.store = click.store;
        cashbackTxn.click_id = click;
        cashbackTxn.cashback = cashbackTxn.sale_amount * click.store.cashbackPercent / 100;
        cashbackTxn.txn_date_time = (new Date());
      })

      await transactionalEntityManager.save(cashbackTxn);

    }).then(async () => {
      return res.status(201).json({ message: "Postback Log created successfully" });
    })

  } catch (error) {
    return res.status(400).json(error);
  }
};

const getLogById = async (req: Request, res: Response) => {
  try {
    const log = await getRepository(PostbackLog).findOneOrFail({
      where: { id: Number(req.params.id) },
      relations: ["affiliateNetwork"],
    });
    return res.status(200).json(log);
  } catch (error) {
    return res.status(404).json({ error: "Postback Log not found" });
  }
};

const getLogsByNetworkId = async (req: Request, res: Response) => {
  try {
    const logs = await getRepository(PostbackLog).find({
      where: { affiliateNetwork: Number(req.params.id) },
    });
    return res.status(200).json(logs);
  } catch (error) {
    return res.status(400).json({ error });
  }
};

const updateLogById = async (req: Request, res: Response) => {
  try {
    const log = await getRepository(PostbackLog).findOneOrFail({
      where: { id: Number(req.params.id) },
    });
    if (log) {
      getRepository(PostbackLog).merge(log, { ...req.body });
      const updatedNetwork = await getRepository(PostbackLog).save(log);
      return res.status(200).json(updatedNetwork);
    }
  } catch (err) {
    return res.status(400).json(err);
  }
};

const deleteLogById = async (req: Request, res: Response) => {
  try {
    const log = await getRepository(PostbackLog).findOneOrFail({
      where: { id: Number(req.params.id) },
    });
    await getRepository(PostbackLog).remove(log);
    return res
      .status(204)
      .json({ message: "Postback Log has been deleted successfully" });
  } catch (err) {
    return res.status(400).json(err);
  }
};

export {
  getAllLogs,
  createOrUpdatePostbackLog,
  getLogById,
  getLogsByNetworkId,
  updateLogById,
  deleteLogById,
};
