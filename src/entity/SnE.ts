import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

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

    @Column('timestamp with time zone', { nullable: false, default: () => 'CURRENT_TIMESTAMP' })
    created: Date;

}
