import {
    Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne
} from "typeorm";
import { User } from "./User";

export enum Mode {
    PAYTM = "paytm",
    BANK = "bank"
}


@Entity()
export class PaymentMode {

    @PrimaryGeneratedColumn()
    id: number;

    @Column({
        type: "enum",
        enum: Mode,
    })
    platform: Mode

    @Column({nullable: true})
    bankname: string;

    @Column()
    accountnumber: string;

    @Column({nullable: true})
    ifsc: string;

    @Column({nullable: true})
    accountname: string;

    @Column({nullable: true})
    accounttype: string;

    @Column({nullable: true})
    accountbranch: string;

    @Column({default: true})
    enable: boolean;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @ManyToOne(
        () => User,
        (user: User) => user.paymentmodes,
        { onDelete:"NO ACTION"  , onUpdate: "NO ACTION" }
    )
    user: User;

}
