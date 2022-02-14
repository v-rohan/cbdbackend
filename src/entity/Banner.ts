import { Column, PrimaryGeneratedColumn, Entity } from "typeorm";

@Entity()
export class Banner {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: "varchar", length: 255, nullable: true })
    image: string;

    @Column({ type: "varchar", length: 255, nullable: true })
    link: string;
}
