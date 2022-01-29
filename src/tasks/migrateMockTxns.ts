import { getManager, getRepository } from "typeorm";
import { AffiliateNetwork } from "../entity/AffiliateNetwork";
import { CashbackTxn } from "../entity/Transactions/CashbackTxn";
import { MockTxn } from "../entity/Transactions/MockTxn";
import { SalesTxn } from "../entity/Transactions/SalesTxn";
import { Clicks } from "../entity/Clicks";

const MigrateMockTxns = async () => {
    const mockTxns = await getRepository(MockTxn).find({
        relations: ["network_id"],
    });
    mockTxns.forEach(async (mockTxn) => {
        try {
            let salesTxn: SalesTxn;
            let cashbackTxn: CashbackTxn;
            try {
                salesTxn = await getRepository(SalesTxn).findOneOrFail({
                    where: { aff_sub1: mockTxn.aff_sub1 },
                });
                cashbackTxn = await getRepository(CashbackTxn).findOneOrFail({
                    where: { aff_sub1: mockTxn.aff_sub1 },
                });
            } catch (err) {
                salesTxn = new SalesTxn();
                cashbackTxn = new CashbackTxn();
            }

            let newMockTxn = { ...mockTxn };
            delete newMockTxn['id'];
            delete newMockTxn['created_at'];
            delete newMockTxn['updated_at'];

            Object.keys(salesTxn).filter(key => key in newMockTxn).forEach(key => {
                salesTxn[key] = newMockTxn[key]
            })
            Object.keys(cashbackTxn).filter(key => key in newMockTxn).forEach(key => {
                cashbackTxn[key] = newMockTxn[key]
            })

            salesTxn.commission_amount = salesTxn.base_commission;
            let affNet = await getRepository(AffiliateNetwork).findOneOrFail(
                {where: {id: salesTxn.network_id}}
            );
            for (const key in affNet.saleStatuses) {
                if (affNet.saleStatuses[key] === salesTxn.status) {
                    salesTxn.sale_status = key
                }
            }

            cashbackTxn.click_id = mockTxn.aff_sub1;
            var click = (await getRepository(Clicks).findOneOrFail(
                {where: {id: Number(cashbackTxn.click_id)}}
            ))
            cashbackTxn.user = click.user;
            cashbackTxn.store = click.store;
            cashbackTxn.cashback = cashbackTxn.sale_amount * click.store.cashbackPercent / 100
            cashbackTxn.txn_date_time = (new Date());

            await getManager().transaction(async (transaction) => {
                await transaction.save(salesTxn);
                await transaction.save(cashbackTxn);
            });

        } catch (err) {
            return err;
        }
    });
};

export default MigrateMockTxns;
