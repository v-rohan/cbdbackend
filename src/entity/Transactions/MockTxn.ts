import {
    Column,
    CreateDateColumn,
    Entity,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn,
    UpdateDateColumn
} from "typeorm";
import { AffiliateNetwork } from "../AffiliateNetwork";
import { ColumnNumericTransformer, StatusOpts } from "./Common";


@Entity()
export class MockTxn {

    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => AffiliateNetwork, {onDelete: "CASCADE", onUpdate: "CASCADE"})
    @JoinColumn([{ name: "affiliateNetwork", referencedColumnName: "name" }])
    networkId: string;

    @Column({ nullable: true })
    networkCampId: string;

    @Column()
    txnId: string;

    @Column({ nullable: true })
    commissionId: string;

    @Column()
    orderId: string;
    
    @Column({ type: "date", nullable: true })
    saleDate: string;

    @Column('numeric', {
        scale: 2, 
        nullable: true,
        transformer: new ColumnNumericTransformer()
    })
    saleAmount: number;

    @Column('numeric', {
        scale: 2, 
        nullable: true,
        transformer: new ColumnNumericTransformer()
    })
    baseCommission: number;

    @Column()
    currency: string;

    @Column({
        type: "enum",
        enum: StatusOpts,
        default: StatusOpts.PENDING
    })
    status: StatusOpts;

    @Column({ nullable: true })
    affSub1: string;

    @Column({ nullable: true })
    affSub2: string;
    
    @Column({ nullable: true })
    affSub3: string;

    @Column({ nullable: true })
    affSub4: string;

    @Column({ nullable: true })
    affSub5: string;

    @Column({ type: 'text', nullable: true })
    exInfo: string;

    @CreateDateColumn()
    createdAt: string;

    @UpdateDateColumn()
    updatedAt: string;

}