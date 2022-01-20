import {
    Column,
    CreateDateColumn,
    Entity,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn,
    UpdateDateColumn
} from "typeorm";
import { User } from "../User";
import { ColumnNumericTransformer, AcceptedStatusOpts } from "./Common";


@Entity()
export class ReferrerTxns {

    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => User , {onDelete: 'CASCADE', onUpdate: 'CASCADE'})
    @JoinColumn([{ name: 'user', referencedColumnName: 'email' }])
    user: User;


    @ManyToOne(() => User , {onDelete: 'CASCADE', onUpdate: 'CASCADE'})
    @JoinColumn([{ name: 'shopper', referencedColumnName: 'email' }])
    shopper: User;

    @Column({ nullable: true })
    saleId: string;

    @Column({ nullable: true })
    store: string;

    @Column('numeric', {
        scale: 2,
        nullable: true,
        transformer: new ColumnNumericTransformer()
    })
    saleAmount: number;

    @Column({ type: 'timestamp' })
    txnDateTime: Date;

    @Column('numeric', {
        scale: 2,
        nullable: true,
        transformer: new ColumnNumericTransformer()
    })
    refAmount: number;

    @Column({ nullable: true })
    currency: string;

    @Column({
        type: "enum",
        enum: AcceptedStatusOpts,
        default: AcceptedStatusOpts.PENDING
    })
    status: AcceptedStatusOpts;

    @Column({ type: 'boolean', nullable: true })
    mailSent: boolean;

    @CreateDateColumn()
    createdAt: string;

    @UpdateDateColumn()
    updatedAt: string;

}