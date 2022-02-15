import {
    Entity,
    ManyToMany,
    PrimaryGeneratedColumn,
    CreateDateColumn,
    UpdateDateColumn,
    Column,
    OneToMany,
    ManyToOne,
} from "typeorm";
import { AffiliateNetwork } from "./AffiliateNetwork";
import { CouponCategory } from "./CouponCategory";
import { Store } from "./Store";

@Entity()
export class Coupon {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: "varchar", length: 255, nullable: true })
    discount: string;

    @Column({ type: "varchar", length: 255, nullable: true })
    coupon_code: string;

    @Column({ type: "varchar", length: 255, nullable: true })
    link: string;

    @Column({ type: "boolean", default: false })
    is_affiliate_link: boolean;

    @Column({ type: "date", nullable: true })
    expiry_date: Date;

    @ManyToOne(() => Store, (store) => store.coupons, {
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
    })
    store_id: Store;

    @ManyToOne(() => AffiliateNetwork, (affNet) => affNet.coupons, {
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
    })
    network_id: AffiliateNetwork;

    @ManyToMany(() => CouponCategory, (couponCat) => couponCat.coupons, {
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
    })
    categories: CouponCategory[];

    @Column({ type: "boolean", default: true })
    featured: boolean;

    @Column({ type: "varchar", length: 50, nullable: true })
    network_coupon_id: string;

    @Column({ type: "integer", nullable: true })
    clicks: number;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;
}
