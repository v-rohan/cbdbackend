import { getManager, getRepository } from "typeorm";
import { AffiliateNetwork } from "../entity/AffiliateNetwork";
import { CashbackTxn } from "../entity/Transactions/CashbackTxn";
import { MockTxn } from "../entity/Transactions/MockTxn";
import { SalesTxn } from "../entity/Transactions/SalesTxn";
import { Clicks } from "../entity/Clicks";
import { StatusOpts, AcceptedStatusOpts } from "../entity/Transactions/Common";
import { ReferrerTxn } from "../entity/Transactions/ReferrerTxn";
import { SnE } from "../entity/SnE";

const MigrateMockTxns = async () => {
    const mockTxns = await getRepository(MockTxn).find({
        relations: ["network_id"],
    });
    mockTxns.forEach(async (mockTxn) => {
        try {
            let salesTxn: SalesTxn;
            let cashbackTxn: CashbackTxn;
            var referrerTxn: ReferrerTxn;
            try {
                salesTxn = await getRepository(SalesTxn).findOneOrFail({
                    where: { aff_sub1: mockTxn.aff_sub1 },
                });
                cashbackTxn = await getRepository(CashbackTxn).findOneOrFail({
                    where: { click_id: mockTxn.aff_sub1 },
                });
                referrerTxn = await getRepository(ReferrerTxn).findOneOrFail({
                    where: { user: click.user.referralUser },
                });
            } catch (err) {
                salesTxn = new SalesTxn();
                cashbackTxn = new CashbackTxn();
                referrerTxn = new ReferrerTxn();
            }

            let newMockTxn = { ...mockTxn };
            delete newMockTxn["id"];
            delete newMockTxn["created_at"];
            delete newMockTxn["updated_at"];

            Object.keys(salesTxn)
                .filter((key) => key in newMockTxn)
                .forEach((key) => {
                    salesTxn[key] = newMockTxn[key];
                });
            Object.keys(cashbackTxn)
                .filter((key) => key in newMockTxn)
                .forEach((key) => {
                    cashbackTxn[key] = newMockTxn[key];
                });

            salesTxn.commission_amount = salesTxn.base_commission;

            salesTxn.status = newMockTxn.status;
            if (newMockTxn.status == StatusOpts.delayed) {
                cashbackTxn.status = AcceptedStatusOpts.pending;
                referrerTxn.status = AcceptedStatusOpts.pending;
            } else {
                cashbackTxn.status = AcceptedStatusOpts[newMockTxn.status];
                referrerTxn.status = AcceptedStatusOpts[salesTxn.status];
            }

            try {
                var click = await getRepository(Clicks).findOneOrFail({
                    where: { id: Number(mockTxn.aff_sub1) },
                });
            } catch (err) {
                console.log(err);
                return { message: "Click not found" };
            }

            cashbackTxn.click_id = click;
            cashbackTxn.user = click.user;
            cashbackTxn.store = click.store;
            cashbackTxn.cashback =
                (cashbackTxn.sale_amount * click.store.cashback_percent) / 100;
            cashbackTxn.txn_date_time = new Date();

            await getManager().transaction(async (transaction) => {
                await transaction.save(salesTxn);
                await transaction.save(cashbackTxn);
                if (click.user.referralUser != null) {
                    referrerTxn.sale_id = cashbackTxn.sale_id;
                    referrerTxn.user = click.user.referralUser;
                    referrerTxn.shopper = click.user;
                    referrerTxn.store = click.store;
                    referrerTxn.sale_amount = cashbackTxn.sale_amount;
                    referrerTxn.currency = "INR";
                    referrerTxn.referrer_amount = cashbackTxn.cashback * 0.1;
                    referrerTxn.mail_sent = false;
                    referrerTxn.txn_date_time = new Date();

                    await transaction.save(referrerTxn);
                }
                if (
                    cashbackTxn.status == AcceptedStatusOpts.confirmed &&
                    click.ref != null
                ) {
                    var sne: SnE = await transaction.connection
                        .getRepository(SnE)
                        .findOneOrFail({ shortlink: click.ref });

                    sne.earning += cashbackTxn.cashback;
                    await transaction.save(sne);
                }
            });
        } catch (err) {
            return err;
        }
    });
};

export default MigrateMockTxns;
