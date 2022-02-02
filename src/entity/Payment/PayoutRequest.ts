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
import { PaymentMode } from "./PaymentMode";

enum StatusOpts {
    created = "created",
    processing = "processing",
    completed = "completed",
    declined = "declined",
}

@Entity()
export class PayoutRequest {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ unique: true })
    payment_id: string;

    @ManyToOne(() => User, {
        onDelete: "NO ACTION",
        onUpdate: "NO ACTION",
    })
    @JoinColumn([{ name: "user", referencedColumnName: "id" }])
    user_id: User;

    @ManyToOne(() => PaymentMode, {
        onDelete: "NO ACTION",
        onUpdate: "NO ACTION",
    })
    @JoinColumn([{ name: "payment_mode", referencedColumnName: "id" }])
    payment_mode: PaymentMode;

    @Column({ type: "decimal", default: 0 })
    cashback_amount: number;

    @Column({ type: "decimal", default: 0 })
    reward_amount: number;

    @Column({ type: "enum", enum: StatusOpts, default: StatusOpts.created })
    status: StatusOpts;

    @Column({ nullable: true })
    api_status: string;

    @Column({ type: "json", nullable: true })
    api_response: any;

    @Column({ nullable: true })
    note: string;

    @Column({ nullable: true })
    payment_ref_num: string;

    @Column({ type: "date", nullable: true })
    paid_at: string;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;
}
