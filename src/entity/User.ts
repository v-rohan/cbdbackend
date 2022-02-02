import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm";
import { Clicks } from "./Clicks";
import { PaymentMode } from "./Payment/PaymentMode";
import { SnE } from "./SnE";

export enum UserRole {
    ADMIN = "admin",
    USER = "user",
}

@Entity()
export class User {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ nullable: true })
    firstName: string;

    @Column({ nullable: true })
    lastName: string;

    @Column({ unique: true })
    email: string;

    @Column()
    password: string;

    @Column({
        type: "enum",
        enum: UserRole,
        default: UserRole.USER,
    })
    role: UserRole;

    @OneToMany(() => SnE, (SnE) => SnE.user)
    snelinks: SnE[];

    @OneToMany(() => PaymentMode, (PaymentMode) => PaymentMode.user)
    paymentmodes: PaymentMode[];

    @OneToMany(() => Clicks, (Clicks) => Clicks.user)
    clicks: Clicks[];

    @Column({ unique: true })
    referralLink: string;
}
