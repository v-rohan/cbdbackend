import {
    Column,
    Entity,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn,
} from "typeorm";
import { User } from "../User";
import { ColumnNumericTransformer, AcceptedStatusOpts } from "./Common";

@Entity()
export class BonusTxn {

    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => User , {onDelete: 'CASCADE', onUpdate: 'CASCADE'})
    @JoinColumn([{ name: 'user', referencedColumnName: 'email' }])
    user: User;

    @Column()
    bonusCode: string;

    @Column('numeric', {
        scale: 2,
        nullable: true,
        transformer: new ColumnNumericTransformer()
    })
    amount: Number;

    @Column({ type: 'timestamp', nullable: true })
    awardedOn: Date;

    @Column({ type: 'timestamp', nullable: true })
    expiresOn: Date;

    @Column({
        type: "enum",
        enum: AcceptedStatusOpts,
        default: AcceptedStatusOpts.PENDING
    })
    status: AcceptedStatusOpts;

}