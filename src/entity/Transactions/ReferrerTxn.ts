import { Store } from "../Store";
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
import { AcceptedStatusOpts } from "./Common";


@Entity()
export class ReferrerTxn {

    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => User , {onDelete: 'NO ACTION', onUpdate: 'CASCADE'})
    @JoinColumn([{ name: 'user', referencedColumnName: 'email' }])
    user: User;


    @ManyToOne(() => User , {onDelete: 'NO ACTION', onUpdate: 'CASCADE'})
    @JoinColumn([{ name: 'shopper', referencedColumnName: 'email' }])
    shopper: User;

    @Column({ nullable: true })
    sale_id: string;

    @ManyToOne(() => Store, (store) => store.refTxns, {onDelete: "NO ACTION", onUpdate: "CASCADE"})
    store: Store;

    @Column({ type: "decimal", nullable: false })
    sale_amount: number;

    @Column({ type: 'timestamp' })
    txn_date_time: Date;

    @Column({ type: "decimal", nullable: false })
    referrer_mount: number;

    @Column({ nullable: true })
    currency: string;

    @Column({
        type: "enum",
        enum: AcceptedStatusOpts,
        default: AcceptedStatusOpts.pending
    })
    status: AcceptedStatusOpts;

    @Column({ type: 'boolean', nullable: true })
    mail_sent: boolean;

    @CreateDateColumn()
    created_at: string;

    @UpdateDateColumn()
    updated_at: string;

}