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
import { Store } from "../Store";
import { User } from "../User";
import { ColumnNumericTransformer, AcceptedStatusOpts } from "./Common";


@Entity()
export class CashbackTxn {

    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => User , {onDelete: 'NO ACTION', onUpdate: 'CASCADE'})
    @JoinColumn([{ name: 'user', referencedColumnName: 'email' }])
    user: User;

    @Column({ nullable: true })
    saleId: string;

    @ManyToOne(() => AffiliateNetwork, (affNet) => affNet.cashbackTxns,
        {onDelete: "NO ACTION", onUpdate: "CASCADE"}
    )
    networkId: AffiliateNetwork;

    @Column({ nullable: true })
    orderId: string;

    @ManyToOne(() => Store, (store) => store.cashbackTxns,
        {onDelete: "NO ACTION", onUpdate: "NO ACTION"}
    )
    store: Store;

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
