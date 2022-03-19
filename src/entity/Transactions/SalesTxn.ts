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
import { StatusOpts } from "./Common";

@Entity()
export class SalesTxn {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => AffiliateNetwork, (affNet) => affNet.salesTxns, {
        onDelete: "NO ACTION",
        onUpdate: "CASCADE",
    })
    network_id: AffiliateNetwork;


    @ManyToOne(() => User, { onDelete: "NO ACTION", onUpdate: "CASCADE" })
    @JoinColumn([{ name: "user", referencedColumnName: "id" }])
    user: User;

    @Column({ nullable: true })
    network_campaign_id: string;

    @Column()
    transaction_id: string;

    @Column({ nullable: true })
    commission_id: string;

    @Column()
    order_id: string;

    @ManyToOne(() => Store, (store) => store.salesTxns, {
        onDelete: "NO ACTION",
        onUpdate: "NO ACTION",
    })
    store: Store;

    @Column({ type: "date", nullable: true })
    click_date: string;

    @Column({ nullable: true })
    sale_date: string;

    @Column({ type: "decimal", nullable: false })
    sale_amount: number;

    @Column({ type: "decimal", nullable: false })
    base_commission: number;

    @Column({ type: "decimal", nullable: false })
    commission_amount: number;

    @Column()
    currency: string;

    @Column()
    sale_status: string;

    @Column({
        type: "enum",
        enum: StatusOpts,
        default: StatusOpts.pending,
    })
    status: StatusOpts;

    @Column({ type: "timestamp", nullable: true })
    sale_update_time: Date;

    @Column({ nullable: true })
    aff_sub1: string;

    @Column({ nullable: true })
    aff_sub2: string;

    @Column({ nullable: true })
    aff_sub3: string;

    @Column({ nullable: true })
    aff_sub4: string;

    @Column({ nullable: true })
    aff_sub5: string;

    @Column({ type: "text", nullable: true })
    ex_info: string;

    @Column({ nullable: true })
    batch_id: string;

    @CreateDateColumn()
    created_at: string;

    @UpdateDateColumn()
    updated_at: string;
}
