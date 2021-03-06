import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    OneToMany,
    CreateDateColumn,
    ManyToOne,
    OneToOne,
    JoinColumn,
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
    is_profile_complete: boolean;

    @Column({ unique: false, nullable: true })
    city: string;

    @Column({ nullable: true, default: null })
    date_of_birth: Date;

    @Column({ nullable: true, default: null })
    gender: string;

    @Column({ nullable: true, default: false })
    is_user_banned: boolean;

    @Column({ nullable: true, default: null })
    email_verified_at: Date;

    @Column({ nullable: true, default: null })
    mobile_verified_at: Date;

    @CreateDateColumn()
    user_registered: Date;

    // @OneToOne(() => Verify, (verify) => verify.id)
    // verify: Verify;
}

@Entity()
export class Verify {
    @PrimaryGeneratedColumn()
    id: number;

    @OneToOne(() => User, (user) => user.id, {
        cascade: true,
        // onDelete: "NO ACTION",
        // onUpdate: "NO ACTION",
        // nullable: false,
    })
    @JoinColumn()
    user: User;

    @Column({ type: "varchar", length: 128, nullable: false })
    verify_hash: string;
}
