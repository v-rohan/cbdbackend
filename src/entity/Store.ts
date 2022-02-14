import {
    Column,
    CreateDateColumn,
    Entity,
    OneToMany,
    ManyToOne,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
    ManyToMany,
} from "typeorm";
import { AffiliateNetwork } from "./AffiliateNetwork";
import { CashbackRates } from "./CashbackRates";
import { Clicks } from "./Clicks";
import { Coupon } from "./Coupon";
import { SnE } from "./SnE";
import { StoreCategory } from "./StoreCategory";
import { CashbackTxn } from "./Transactions/CashbackTxn";
import { ReferrerTxn } from "./Transactions/ReferrerTxn";

export enum CashbackType {
    CASHBACK = "Cashback",
    REWARD = "Reward",
}

@Entity()
export class Store {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ nullable: false })
    affiliate_link: string;

    @Column({ nullable: false, default: false })
    featured: boolean;

    @Column({ nullable: false, default: false })
    cashback_enabled: boolean;

    @Column({ nullable: true, type: "float", default: 0 })
    cashback_percent: any;

    @Column({ type: "decimal", precision: 10, scale: 2, default: 0.0 })
    cashback: number;

    @Column({ type: "text", default: "" })
    amount_type: string;

    @Column({ type: "text", default: "" })
    rate_type: string;

    @Column({ type: "varchar", length: 255, default: "" })
    cashback_was: string;

    @Column({ nullable: true })
    tracking_speed: string;

    @Column({ type: "integer" })
    visits: number;

    @Column({ nullable: true, type: "text" })
    terms: string;

    @Column({ nullable: true, type: "text" })
    tips: string;

    @Column({ type: "varchar", length: 255, default: "" })
    h1: string;

    @Column({ type: "varchar", length: 255, default: "" })
    h2: string;

    @Column({ nullable: true })
    description: string;

    @Column({ type: "varchar", length: 255, default: "" })
    logo: string;

    @Column({
        type: "enum",
        enum: CashbackType,
        default: CashbackType.CASHBACK,
    })
    cashback_type: CashbackType;

    @Column({ type: "integer", default: 0 })
    coupon_count: number;

    @Column({ nullable: false })
    homepage: string;

    @Column({ type: "varchar", length: 50, default: "" })
    network_campaign_id: string;

    @ManyToOne(
        () => AffiliateNetwork,
        (network: AffiliateNetwork) => network.stores,
        {
            onDelete: "CASCADE",
            onUpdate: "NO ACTION",
        }
    )
    network_id: AffiliateNetwork;

    @Column({ type: "integer", default: 0 })
    clicks: number;

    @Column({ nullable: true })
    payout_days: number;

    @Column({ nullable: false, default: false })
    is_claimable: boolean;

    @Column({ type: "varchar", length: 255, default: "" })
    domain_name: string;

    @Column({ type: "varchar", length: 1000, default: "" })
    apply_coupon: string;

    @Column({ type: "varchar", length: 255, default: "" })
    checkout_url: string;

    @Column({ nullable: false })
    name: string;

    @Column({ type: "varchar", length: 200, nullable: false })
    slug: string;

    @Column({ type: "varchar", length: 20, nullable: false })
    status: string;

    @Column({ type: "varchar", length: 6, nullable: true })
    color1: string;

    @Column({ type: "varchar", length: 6, nullable: true })
    color2: string;

    @OneToMany(() => CashbackRates, (cashbackRate) => cashbackRate.store)
    cashbackRates: CashbackRates[];

    @OneToMany(() => CashbackTxn, (cashbackTxn) => cashbackTxn.store)
    cashbackTxns: CashbackTxn[];

    @OneToMany(() => ReferrerTxn, (refTxn) => refTxn.store)
    refTxns: ReferrerTxn[];

    @OneToMany(() => SnE, (SnE) => SnE.store)
    snelinks: SnE[];

    @ManyToMany(() => StoreCategory, (storeCategory) => storeCategory.stores, {
        onDelete: "CASCADE",
        onUpdate: "NO ACTION",
    })
    categories: StoreCategory[];

    @OneToMany(() => Coupon, (coupon) => coupon.store_id, {
        onDelete: "CASCADE",
        onUpdate: "NO ACTION",
    })
    coupons: Coupon[];

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @OneToMany(() => Clicks, (Clicks) => Clicks.store)
    clicks_id: Clicks[];
}
