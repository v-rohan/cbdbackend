import {
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    Entity,
} from "typeorm";

import { Store } from "./Store";
@Entity()
export class Notification {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: "text", nullable: true })
    title: string;

    @Column({ type: "text", nullable: true })
    desc: string;

    @Column({ type: "varchar", length: 255, nullable: true })
    link: string;

    @ManyToOne(() => Store, { onDelete: "NO ACTION", nullable: true })
    @JoinColumn([{ name: "store", referencedColumnName: "id" }])
    store: Store;

    @CreateDateColumn()
    created: Date;
}
