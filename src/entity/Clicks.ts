import {
    Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne
} from "typeorm";
import { AffiliateNetwork } from "./AffiliateNetwork";
import { Store } from "./Store";
import { User } from "./User";

@Entity()
export class Clicks {

    @PrimaryGeneratedColumn()
    id: number;

    @CreateDateColumn()
    createdAt: Date;

    @ManyToOne(
        () => User,
        (user: User) => user.clicks,
        { onDelete: "NO ACTION", onUpdate: "NO ACTION", nullable: false },
    )
    user: User;

    @ManyToOne(
        () => Store,
        (store: Store) => store.clicks,
        { onDelete: "NO ACTION", onUpdate: "NO ACTION", nullable: false},
    )
    store: Store;

    @Column({ nullable: false })
    ipAddress: string;

    @Column({ nullable: false })
    httpReferer: string;

    @ManyToOne(
        () => AffiliateNetwork,
        (network: AffiliateNetwork) => network.clicks,
        { onDelete: "NO ACTION", onUpdate: "NO ACTION", nullable: false },
    )
    network: AffiliateNetwork;

    @Column({ nullable: false })
    sourceType: string;

}
