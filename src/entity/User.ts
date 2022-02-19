import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    OneToMany,
    CreateDateColumn,
    ManyToOne,
} from "typeorm";
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
    first_name: string;

    @Column({ nullable: true })
    last_name: string;

    @Column({ unique: true })
    email: string;

    @Column({ nullable: true })
    mobile: string;

    @Column()
    password: string;

    @Column({
        type: "enum",
        enum: UserRole,
        default: UserRole.USER,
    })
    role: UserRole;

    @Column({ type: "varchar", length: 255, nullable: true })
    image: string;

    @OneToMany(() => SnE, (SnE) => SnE.user)
    snelinks: SnE[];

    @OneToMany(() => PaymentMode, (PaymentMode) => PaymentMode.user)
    paymentmodes: PaymentMode[];

    @OneToMany(() => Clicks, (Clicks) => Clicks.user)
    clicks: Clicks[];

    @Column({ unique: true })
    referralLink: string;

    @Column({ nullable: true, default: null })
    referralUser: Number;

    @Column({ nullable: true, default: false })
    is_email_verified: boolean;

    @Column({ nullable: true, default: false })
    is_mobile_verified: boolean;

    @Column({ nullable: true, default: false })
    is_user_banned: boolean;

    @Column({ nullable: true, default: null })
    email_verified_at: Date;

    @Column({ nullable: true, default: null })
    mobile_verified_at: Date;

    @CreateDateColumn()
    user_registered: Date;
}
