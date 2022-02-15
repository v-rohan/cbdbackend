import { PrimaryGeneratedColumn, Entity, Column, ManyToMany } from "typeorm";
import { Store } from "./Store";

@Entity()
export class StoreCategory {
    @PrimaryGeneratedColumn()
    cat_id: number;

    @Column({ type: "varchar", length: 200 })
    name: string;

    @Column({ type: "varchar", length: 200 })
    slug: string;

    @Column({ type: "varchar", length: 255 })
    image: string;

    @ManyToMany(() => Store, (store) => store.categories, {
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
    })
    stores: Store[];
}
