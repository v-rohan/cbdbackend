import {
    Column,
    CreateDateColumn,
    Entity,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn,
} from "typeorm";
import { User } from "../User";
import { AcceptedStatusOpts } from "./Common";

@Entity()
export class BonusTxn {

    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => User, { onDelete: 'CASCADE', onUpdate: 'CASCADE' })
    @JoinColumn([{ name: 'user', referencedColumnName: 'email' }])
    user: User;

    @Column()
    bonus_code: string;

    @Column({ type: "decimal", nullable: false })
    amount: Number;

    @CreateDateColumn()
    awarded_on: Date;

    @Column({ type: 'timestamptz', nullable: true })
    expires_on: Date;

    @Column({
        type: "enum",
        enum: AcceptedStatusOpts,
        default: AcceptedStatusOpts.pending
    })
    status: AcceptedStatusOpts;

}