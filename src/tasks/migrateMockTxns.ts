import { getManager, getRepository } from "typeorm";
import { AffiliateNetwork } from "../entity/AffiliateNetwork";
import { CashbackTxn } from "../entity/Transactions/CashbackTxn";
import { MockTxn } from "../entity/Transactions/MockTxn";
import { SalesTxn } from "../entity/Transactions/SalesTxn";
import { Clicks } from "../entity/Clicks";
import { StatusOpts, AcceptedStatusOpts } from "../entity/Transactions/Common";
import { ReferrerTxn } from "../entity/Transactions/ReferrerTxn";
import { SnE } from "../entity/SnE";
import { User } from "../entity/User";

const MigrateMockTxns = async () => {
    const mockTxns = await getRepository(MockTxn).find({
        relations: ["network_id"],
    });
    mockTxns.forEach(async (mockTxn) => {
        try {
            let salesTxn: SalesTxn;
            let cashbackTxn: CashbackTxn;
            var referrerTxn: ReferrerTxn;
            var click: Clicks;
            try {
                click = await getRepository(Clicks).findOneOrFail({
                    where: { id: Number(mockTxn.aff_sub1) },
                    relations: ["store", "user"]
                });
            } catch (err) {
                console.log(err);
                return { message: "Click not found" };
            }

            try {
                salesTxn = await getRepository(SalesTxn).findOneOrFail({
                    where: { aff_sub1: String(mockTxn.aff_sub1) },
                });
                cashbackTxn = await getRepository(CashbackTxn).findOneOrFail({
                    where: { click_id: click },
                });
            } catch (err) {
                salesTxn = new SalesTxn();
                cashbackTxn = new CashbackTxn();
            }

            try {
                referrerTxn = await getRepository(ReferrerTxn).findOneOrFail({
                    where: { user: click.user.referralUser },
                });
            } catch (err) {
                referrerTxn = new ReferrerTxn();
            }

            let newMockTxn = { ...mockTxn };
            delete newMockTxn["id"];
            delete newMockTxn["created_at"];
            delete newMockTxn["updated_at"];

            salesTxn.commission_amount = newMockTxn.base_commission;

            salesTxn.status = newMockTxn.status;
            if (newMockTxn.status == StatusOpts.delayed) {
                cashbackTxn.status = AcceptedStatusOpts.pending;
                referrerTxn.status = AcceptedStatusOpts.pending;
            } else {
                cashbackTxn.status = AcceptedStatusOpts[newMockTxn.status];
                referrerTxn.status = AcceptedStatusOpts[salesTxn.status];
            }


            cashbackTxn.click_id = click;
            cashbackTxn.user = click.user;
            cashbackTxn.store = click.store;
            cashbackTxn.cashback =
                (cashbackTxn.sale_amount * click.store.cashback_percent) / 100;
            cashbackTxn.txn_date_time = new Date();

            await getManager().transaction(async (transaction) => {
                Object.keys(
                    await transaction.connection.getMetadata(SalesTxn).propertiesMap)
                    .filter((key: any) => key in newMockTxn)
                    .forEach((keyto: any) => {
                        salesTxn[keyto] = newMockTxn[keyto];
                    });
                salesTxn.sale_status = salesTxn.status

                Object.keys(
                    await transaction.connection.getMetadata(CashbackTxn).propertiesMap)
                    .filter((key: any) => key in newMockTxn)
                    .forEach((keyto: any) => {
                        cashbackTxn[keyto] = newMockTxn[keyto];
                    });
                await transaction.connection.getRepository(SalesTxn).save(salesTxn);
                await transaction.connection.getRepository(CashbackTxn).save(cashbackTxn);

                if (click.user.referralUser !== null) {
                    referrerTxn.sale_id = cashbackTxn.sale_id;
                    try {
                        referrerTxn.user = await getRepository(User).findOneOrFail({
                            where: { id: click.user.referralUser },
                        });
                    } catch (err) {
                        return err;
                    }
                    referrerTxn.shopper = click.user;
                    referrerTxn.store = click.store;
                    referrerTxn.sale_amount = cashbackTxn.sale_amount;
                    referrerTxn.currency = "INR";
                    referrerTxn.referrer_amount = cashbackTxn.cashback * 0.1;
                    referrerTxn.mail_sent = false;
                    referrerTxn.txn_date_time = new Date();
                    await transaction.connection.getRepository(ReferrerTxn).save(referrerTxn);
                }
                if (
                    cashbackTxn.status == AcceptedStatusOpts.confirmed &&
                    click.ref != null
                ) {
                    var sne: SnE = await transaction.connection
                        .getRepository(SnE)
                        .findOneOrFail({ shortlink: click.ref });

                    sne.earning += cashbackTxn.cashback;
                    await transaction.connection.getRepository(SnE).save(sne);
                }
            });
        } catch (err) {
            return err;
        }
    });
    return 1;
};

export default MigrateMockTxns;
