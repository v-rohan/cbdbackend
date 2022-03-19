import {
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    Entity,
} from "typeorm";


@Entity()
export class Notification {

    @Column({ type: "text", nullable: true })
    title: string;

    @Column({ type: "text", nullable: true })
    desc: string;

    @CreateDateColumn()
    created: Date;
}