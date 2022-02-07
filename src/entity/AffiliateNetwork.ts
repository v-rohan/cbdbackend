import {
    Column,
    CreateDateColumn,
    Entity,
    OneToMany,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from "typeorm";
import { Clicks } from "./Clicks";
import { PostbackLog } from "./PostbackLog";
import { Store } from "./Store";
import { CashbackTxn } from "./Transactions/CashbackTxn";
import { MockTxn } from "./Transactions/MockTxn";
import { SalesTxn } from "./Transactions/SalesTxn";

export enum SaleStatus {
    PENDING = "pending",
    APPROVED = "confirmed",
    REJECTED = "declined",
}

export enum Currency {
    INR = "INR",
    USD = "USD",
}

@Entity()
export class AffiliateNetwork {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ unique: true, nullable: false })
    name: string;

    @Column({ nullable: false })
    shortname: string;

    @Column({ nullable: false })
    namespace: string;

    @Column({ nullable: true })
    affiliate_id: string;

    @Column({ nullable: true })
    website_id: string;

    @Column({ nullable: false })
    confirm_days: number;

    @Column({ nullable: false })
    enabled: boolean;

    @Column({ type: "enum", enum: Currency, default: Currency.INR })
    currency: Currency;

    @Column({ nullable: true })
    direct_merchant: number;

    @Column({ type: "json", nullable: true })
    campaign_statuses: any;

    @Column({ type: "json", nullable: true })
    sale_statuses: any;

    @Column({ type: "json", nullable: true })
    columns_update: any;

    @Column({ nullable: true })
    api_key: string;

    @Column({ type: "json", nullable: true })
    auth_tokens: any;

    @Column({ type: "json", nullable: true })
    credentials: any;

    @Column({ nullable: true })
    network_platform: string;

    @Column({ nullable: true })
    subids: string;

    @Column({ nullable: true })
    campaign_info_url: string;

    @Column({ type: "json", nullable: true })
    network_subids: any;

    @OneToMany(() => PostbackLog, (postbackLog) => postbackLog.network_id)
    postbackLogs: PostbackLog[];

    @OneToMany(() => Store, (store) => store.network)
    stores: Store[];

    @OneToMany(() => CashbackTxn, (cashbackTxn) => cashbackTxn.network_id, {
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
    })
    cashbackTxns: CashbackTxn[];

    @OneToMany(() => CashbackTxn, (salesTxn) => salesTxn.network_id, {
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
    })
    salesTxns: SalesTxn[];

    @OneToMany(() => MockTxn, (mockTxn) => mockTxn.network_id, {
        onDelete: "NO ACTION",
        onUpdate: "CASCADE",
    })
    mockTxns: MockTxn[];

    @OneToMany(() => Clicks, (clicks) => clicks.network, {
        onDelete: "NO ACTION",
        onUpdate: "NO ACTION",
    })
    clicks: Clicks[];

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;
}
