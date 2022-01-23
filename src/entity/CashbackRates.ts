import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from "typeorm";
import { Store } from "./Store";

export enum AmountType {
  FIXED = "fixed",
  PERCENT = "percent",
}

@Entity()
export class CashbackRates {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  title: string;

  @Column({ type: "enum", enum: AmountType, default: AmountType.FIXED })
  amountType: AmountType;

  @Column({ nullable: false, type: "float" })
  commission: any;

  @Column({ nullable: false, default: false })
  manual: boolean;

  @Column({ nullable: false, default: false })
  enabled: boolean;

  @ManyToOne(() => Store, (store: Store) => store.cashbackRates, {
    onDelete: "CASCADE",
    onUpdate: "NO ACTION",
  })
  store: Store;
}
