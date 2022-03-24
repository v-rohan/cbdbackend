import {
    Column,
    PrimaryGeneratedColumn,
    Entity,
    ManyToOne,
    JoinColumn,
} from "typeorm";
import { Store } from "../entity/Store";
@Entity()
export class Banner {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: "varchar", length: 255, nullable: true })
    image: string;

    @Column({ type: "varchar", length: 255, nullable: true })
    link: string;

    @ManyToOne(() => Store, { onDelete: "NO ACTION", nullable: true })
    @JoinColumn([{ name: "store", referencedColumnName: "id" }])
    store: Store;
}
