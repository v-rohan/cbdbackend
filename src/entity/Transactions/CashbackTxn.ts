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
    @JoinColumn([{ name: 'user', referencedColumnName: 'id' }])
    user: User;

    @Column({ nullable: true })
    sale_id: string;

    @ManyToOne(() => AffiliateNetwork, (affNet) => affNet.cashbackTxns,
        {onDelete: "NO ACTION", onUpdate: "CASCADE"}
    )
    network_id: AffiliateNetwork;

    @Column({ nullable: true })
    order_id: string;

    @ManyToOne(() => Store, (store) => store.cashbackTxns,
        {onDelete: "NO ACTION", onUpdate: "NO ACTION"}
    )
    store: Store;

    @Column({ nullable: true })
    click_id: Number;

    @Column('numeric', {
        // precision: 2,
        scale: 2,
        nullable: true,
        transformer: new ColumnNumericTransformer()
    })
    sale_amount: number;

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
    txn_date_time: Date;

    @Column({ type: 'boolean', nullable: true })
    mail_sent: boolean;

    @CreateDateColumn()
    created_at: string;

    @UpdateDateColumn()
    updated_at: string;

}
