import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { AffiliateNetwork } from "./AffiliateNetwork";
import { CashbackRates } from "./CashbackRates";

export enum CashbackType {
  CASHBACK = "Cashback",
  REWARD = "Reward",
}

@Entity()
export class Store {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: false })
  store: string;

  @Column({ nullable: false })
  homepage: string;

  @Column({ nullable: false })
  affiliateLink: string;

  @ManyToOne(() => AffiliateNetwork, (network: AffiliateNetwork) => network.stores, {
    onDelete: "CASCADE",
    onUpdate: "NO ACTION",
  })
  network: AffiliateNetwork;

  @Column({ nullable: false, default: false })
  featured: boolean;

  @Column({ nullable: false, default: false })
  isClaimable: boolean;

  @Column({ nullable: true, type: "text" })
  terms: string;

  @Column({ nullable: false, default: false })
  cashbackEnabled: boolean;

  @Column({ type: "enum", enum: CashbackType, default: CashbackType.CASHBACK })
  cashbackType: CashbackType;

  @Column({ nullable: true, type: "float", default: 0 })
  cashbackPercent: any;

  @Column({ nullable: true })
  trackingSpeed: string;

  @Column({ nullable: true })
  payoutDays: number;

  @Column({ nullable: true })
  description: string;

  @Column({ nullable: true, type: "text" })
  tips: string;

  @OneToMany(() => CashbackRates, (cashbackRate) => cashbackRate.store)
  cashbackRates: CashbackRates[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
