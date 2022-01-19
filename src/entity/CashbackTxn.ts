import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { User } from "./User";

class ColumnNumericTransformer {
    to(data: number): number {
        return data;
    }
    from(data: string): number {
        return parseFloat(data);
    }
}


@Entity()
export class MockTxn {

    @PrimaryGeneratedColumn()
    id: number;

    @Column({ nullable: true })
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

    @Column()
    status: string;

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

@Entity()
export class SalesTxn {

    @PrimaryGeneratedColumn()
    id: number;

    @Column({ nullable: true })
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
    clickDate: string;

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

    @Column('numeric', {
        scale: 2, 
        nullable: true,
        transformer: new ColumnNumericTransformer()
    })
    commissionAmt: number;

    @Column()
    currency: string;

    @Column()
    saleStatus: string;

    @Column()
    status: string;

    @Column({ type: 'timestamp', nullable: true })
    saleUpdTime: Date;

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

    @Column({ nullable: true })
    batchId: string;

    @CreateDateColumn()
    createdAt: string;

    @UpdateDateColumn()
    updatedAt: string;

}

@Entity()
export class CashbackTxn {

    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne( () => User , {onDelete: 'CASCADE', onUpdate: 'CASCADE'})
    @JoinColumn([{ name: 'user', referencedColumnName: 'email' }])
    user: User;

    @Column({ nullable: true })
    saleId: string;

    @Column({ nullable: true })
    networkId: string;

    @Column({ nullable: true })
    orderId: string;

    @Column({ nullable: true })
    store: string

    @Column({ nullable: true })
    clickId: string;

    @Column('numeric', {
        // precision: 2,
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
    cashback: number;

    @Column({ nullable: true })
    currency: string;

    @Column()
    status: string;

    @Column({ type: 'timestamp', nullable: true })
    txnDateTime: Date;

    @Column({ type: 'boolean', nullable: true })
    mailSent: boolean;

    @CreateDateColumn()
    createdAt: string;

    @UpdateDateColumn()
    updatedAt: string;

 }

 @Entity()
export class BonusTxn {

     @PrimaryGeneratedColumn()
     id: number;

     @ManyToOne( () => User , {onDelete: 'CASCADE', onUpdate: 'CASCADE'})
     @JoinColumn([{ name: 'user', referencedColumnName: 'email' }])
     user: User;

     @Column({ nullable: true })
     saleId: string;

     @Column({ nullable: true })
     networkId: string;

     @Column({ nullable: true })
     orderId: string;

     @Column({ nullable: true })
     store: string

     @Column({ nullable: true })
     clickId: string;

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
     cashback: number;

     @Column({ nullable: true })
     currency: string;

     @Column()
     status: string;

     @Column({ type: 'timestamp', nullable: true })
     txnDateTime: Date;

     @Column({ type: 'boolean', nullable: true })
     mailSent: boolean;

     @CreateDateColumn()
     createdAt: string;

     @UpdateDateColumn()
     updatedAt: string;

 }


 @Entity()
export class ReferrerTxns {

    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne( () => User , {onDelete: 'CASCADE', onUpdate: 'CASCADE'})
    @JoinColumn([{ name: 'user', referencedColumnName: 'email' }])
    user: User;


    @ManyToOne( () => User , {onDelete: 'CASCADE', onUpdate: 'CASCADE'})
    @JoinColumn([{ name: 'shopper', referencedColumnName: 'email' }])
    shopper: User;

    @Column({ nullable: true })
    saleId: string;

    @Column({ nullable: true })
    store: string;

    @Column('numeric', {
        scale: 2,
        nullable: true,
        transformer: new ColumnNumericTransformer()
    })
    saleAmount: number;

    @Column({ type: 'timestamp' })
    txnDateTime: Date;

    @Column('numeric', {
        scale: 2,
        nullable: true,
        transformer: new ColumnNumericTransformer()
    })
    refAmount: number;

    @Column({ nullable: true })
    currency: string;

    @Column()
    status: string;

    @Column({ type: 'boolean', nullable: true })
    mailSent: boolean;

    @CreateDateColumn()
    createdAt: string;

    @UpdateDateColumn()
    updatedAt: string;

}