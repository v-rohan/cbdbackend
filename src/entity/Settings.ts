import {
    PrimaryGeneratedColumn,
    Entity,
    Column,
    ManyToMany,
    JoinTable,
} from "typeorm";

@Entity()
export class Settings {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ nullable: false, default: false })
    referralEnabled: boolean;

    @Column({ nullable: false, default: 10 })
    referralPercent: number;
}
