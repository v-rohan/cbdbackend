import {
    Column,
    CreateDateColumn,
    Entity,
    ManyToOne,
    PrimaryGeneratedColumn,
    UpdateDateColumn
} from "typeorm";
import { AffiliateNetwork } from "../AffiliateNetwork";
import { StatusOpts } from "./Common";


@Entity()
export class MockTxn {

    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => AffiliateNetwork, (affNet) => affNet.mockTxns , {onDelete: "CASCADE", onUpdate: "CASCADE"})
    network_id: number;

    @Column({ nullable: true })
    network_campaign_id: string;

    @Column()
    transaction_id: string;

    @Column({ nullable: true })
    commission_id: string;

    @Column()
    order_id: string;
    
    @Column({ type: "date", nullable: true })
    sale_date: string;

    @Column({ type: "decimal", nullable: false })
    sale_amount: number;

    @Column({ type: "decimal", nullable: false })
    base_commission: number;

    @Column()
    currency: string;

    @Column({
        type: "enum",
        enum: StatusOpts,
        default: StatusOpts.pending
    })
    status: StatusOpts;

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

    @Column({ type: 'text', nullable: true })
    extra_information: string;

    @CreateDateColumn()
    created_at: string;

    @UpdateDateColumn()
    updated_at: string;

}