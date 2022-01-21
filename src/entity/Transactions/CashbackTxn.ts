import {
    Column,
    CreateDateColumn,
    Entity,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn,
    UpdateDateColumn
} from "typeorm";
import { AffiliateNetwork } from "../AffiliateNetwork";
import { User } from "../User";
import { ColumnNumericTransformer, AcceptedStatusOpts } from "./Common";


@Entity()
export class CashbackTxn {

    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => User , {onDelete: 'CASCADE', onUpdate: 'CASCADE'})
    @JoinColumn([{ name: 'user', referencedColumnName: 'email' }])
    user: User;

    @Column({ nullable: true })
    saleId: string;

    @ManyToOne(() => AffiliateNetwork, {onDelete: "CASCADE", onUpdate: "CASCADE"})
    @JoinColumn([{ name: "affiliateNetwork", referencedColumnName: "name" }])
    networkId: string;

    @Column({ nullable: true })
    orderId: string;

    @Column({ nullable: true })
    store: string

    @Column({ nullable: true })
    clickId: string;

    @Column('numeric', {
        // precision: 2,
        scale: 2,
        nullable: true,
        transformer: new ColumnNumericTransformer()
    })
    saleAmount: number;

    @Column('numeric', {
        scale: 2,
        nullable: true,
        transformer: new ColumnNumericTransformer()
    })
    cashback: number;

    @Column({ nullable: true })
    currency: string;

    @Column({
        type: "enum",
        enum: AcceptedStatusOpts,
        default: AcceptedStatusOpts.PENDING
    })
    status: AcceptedStatusOpts;

    @Column({ type: 'timestamp', nullable: true })
    txnDateTime: Date;

    @Column({ type: 'boolean', nullable: true })
    mailSent: boolean;

    @CreateDateColumn()
    createdAt: string;

    @UpdateDateColumn()
    updatedAt: string;

}
