import {
    Column,
    CreateDateColumn,
    Entity,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from "typeorm";
import { AffiliateNetwork } from "../AffiliateNetwork";
import { Store } from "../Store";
import { User } from "../User";
import { Clicks } from "../Clicks";
import { AcceptedStatusOpts } from "./Common";

@Entity()
export class CashbackTxn {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => User, { onDelete: "NO ACTION", onUpdate: "CASCADE" })
    @JoinColumn([{ name: "user", referencedColumnName: "id" }])
    user: User;

    @Column({ nullable: true })
    sale_id: string;

    @ManyToOne(() => AffiliateNetwork, (affNet) => affNet.cashbackTxns, {
        onDelete: "NO ACTION",
        onUpdate: "CASCADE",
    })
    network_id: AffiliateNetwork;

    @Column({ nullable: true })
    order_id: string;

    @ManyToOne(() => Store, (store) => store.cashbackTxns, {
        onDelete: "NO ACTION",
        onUpdate: "NO ACTION",
    })
    store: Store;

    @ManyToOne(() => Clicks)
    @JoinColumn([{ name: "click_id", referencedColumnName: "id" }])
    click_id: Clicks;

    @Column({ type: "decimal", nullable: false })
    sale_amount: number;

    @Column({ type: "decimal", nullable: false })
    cashback: number;

    @Column({ nullable: true })
    currency: string;

    @Column({
        type: "enum",
        enum: AcceptedStatusOpts,
        default: AcceptedStatusOpts.pending,
    })
    status: AcceptedStatusOpts;

    @Column({ type: "timestamp", nullable: true })
    txn_date_time: Date;

    @Column({ type: "boolean", nullable: true })
    mail_sent: boolean;

    @CreateDateColumn()
    created_at: string;

    @UpdateDateColumn()
    updated_at: string;
}
