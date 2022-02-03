import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
    JoinColumn,
} from "typeorm";
import { User } from "../User";

export enum Mode {
    paytm = "paytm",
    bank = "bank",
}

@Entity()
export class PaymentMode {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => User, {
        onDelete: "NO ACTION",
        onUpdate: "NO ACTION",
    })
    @JoinColumn([{ name: "user", referencedColumnName: "id" }])
    user: User;

    @Column()
    name: string;

    @Column({
        type: "enum",
        enum: Mode,
        nullable: true,
    })
    method_code: Mode;

    @Column()
    bankname: string;

    @Column()
    account: string;

    @Column({ type: "json", nullable: true })
    inputs: { bank_name: string; ifsc_code: string };

    @Column({ nullable: true })
    verify_code: string;

    @Column({ type: "timestamptz", nullable: true })
    verified_at: Date;

    @Column({ default: true })
    enabled: boolean;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;
}
