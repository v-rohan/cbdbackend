import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class BankImage {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'varchar', length: 500, unique: true })
    ifsc_prefix: string;

    @Column({ type: 'varchar', length: 500 })
    image: string;
}