import {
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    Entity,
} from "typeorm";
import { AffiliateNetwork } from "./AffiliateNetwork";

import { Clicks } from "./Clicks";
import { User } from "./User";
import { Store } from "../entity/Store";

enum ClosedBy {
    user = "user",
    admin = "admin",
}

enum Platform {
    website = "website",
    android = "android",
    mobile = "mobile",
    ios = "ios",
}

export enum MissingClaimStatus {
    open = "open",
    hold = "hold",
    answered = "answered",
    closed = "closed",
}
@Entity()
export class MissingClaim {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => User, { onDelete: "NO ACTION", nullable: true })
    @JoinColumn([{ name: "user", referencedColumnName: "id" }])
    user_id: User;

    @ManyToOne(() => Clicks, { onDelete: "NO ACTION", nullable: true })
    @JoinColumn([{ name: "click_id", referencedColumnName: "id" }])
    click_id: Clicks;

    @ManyToOne(() => Store, { onDelete: "NO ACTION", nullable: true })
    @JoinColumn([{ name: "store_id", referencedColumnName: "id" }])
    store_id: Store;

    @ManyToOne(() => AffiliateNetwork, {
        onDelete: "NO ACTION",
        nullable: true,
    })
    @JoinColumn([{ name: "network_id", referencedColumnName: "id" }])
    network_id: AffiliateNetwork;

    @Column({ type: "timestamp", nullable: true, default: null })
    click_time: Date;

    @Column({ type: "varchar", length: 50, nullable: true, default: null })
    order_id: string;

    @Column({ type: "varchar", length: 3, nullable: true, default: null })
    currency_iso: string;

    @Column({
        type: "decimal",
        precision: 10,
        scale: 2,
        nullable: true,
        default: null,
    })
    order_amount: number;

    @Column({ type: "date", nullable: true, default: null })
    transaction_date: Date;

    @Column({ type: "enum", enum: Platform, default: Platform.website })
    platform: Platform;

    @Column({ type: "varchar", length: 500, nullable: true, default: null })
    user_message: string;

    @Column({ type: "varchar", length: 255, nullable: true })
    image: string;

    @Column({ type: "varchar", length: 500, nullable: true, default: null })
    admin_note: string;

    @Column({
        type: "enum",
        enum: MissingClaimStatus,
        default: MissingClaimStatus.open,
    })
    status: MissingClaimStatus;

    @Column({ type: "enum", enum: ClosedBy, default: null })
    closed_by: ClosedBy;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;
}
