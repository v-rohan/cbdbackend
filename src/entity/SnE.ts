import {
    Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne
} from "typeorm";
import { Store } from "./Store";
import { User } from "./User";

@Entity()
export class SnE {

    @PrimaryGeneratedColumn()
    id: number;

    @Column({ unique: true })
    shortlink: string;

    @Column()
    link: string;

    @Column({ default: 0 })
    clicks: number;

    @Column({ default: 0 })
    earning: number;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @ManyToOne(
        () => User,
        (user: User) => user.snelinks,
        { onDelete: "NO ACTION", onUpdate: "NO ACTION", nullable: false },
    )
    user: User;

    @ManyToOne(
        () => Store,
        (store: Store) => store.snelinks,
        { onDelete: "NO ACTION", onUpdate: "NO ACTION", nullable: false },
    )
    store: Store;

}
