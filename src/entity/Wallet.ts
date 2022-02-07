import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    OneToMany,
    OneToOne,
    JoinColumn,
} from "typeorm";
import { Clicks } from "./Clicks";
import { PaymentMode } from "./Payment/PaymentMode";
import { SnE } from "./SnE";
import { User } from "./User";

export enum UserRole {
    ADMIN = "admin",
    USER = "user",
}

@Entity()
export class Wallet {
    @PrimaryGeneratedColumn()
    id: number;

    @OneToOne(() => User, { onDelete: "NO ACTION" })
    @JoinColumn([{ name: "user", referencedColumnName: "id" }])
    user: User;

    @Column()
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

    @OneToMany(() => SnE, (SnE) => SnE.user, { eager: true })
    snelinks: SnE[];

    @OneToMany(() => PaymentMode, (PaymentMode) => PaymentMode.user, {
        eager: true,
    })
    paymentmodes: PaymentMode[];

    @OneToMany(() => Clicks, (Clicks) => Clicks.user, { eager: true })
    clicks: Clicks[];
}
