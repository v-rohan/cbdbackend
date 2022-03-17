import { Column, Entity, JoinTable, ManyToMany, PrimaryGeneratedColumn } from "typeorm";
import { Coupon } from "./Coupon";

@Entity()
export class CouponCategory {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: "boolean", default: false, nullable: true })
    featured: boolean;

    @Column({ type: "integer", nullable: true })
    visits: number;

    @Column({ type: "varchar", length: 255, nullable: true })
    h1: string;

    @Column({ type: "varchar", length: 255, nullable: true })
    h2: string;

    @Column({ type: "text", nullable: true })
    featured_image_url: string;

    @ManyToMany(() => Coupon, (coupon) => coupon.categories, {
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
    })
    coupons: Coupon[];
}
