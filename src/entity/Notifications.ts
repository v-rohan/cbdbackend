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

    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: "text", nullable: true })
    title: string;

    @Column({ type: "text", nullable: true })
    desc: string;

    @CreateDateColumn()
    created: Date;
}