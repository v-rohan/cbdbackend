import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { Clicks } from "./Clicks";
import { PostbackLog } from "./PostbackLog";
import { Store } from "./Store";
import { CashbackTxn } from "./Transactions/CashbackTxn";
import { MockTxn } from "./Transactions/MockTxn";
import { SalesTxn } from "./Transactions/SalesTxn";

export enum SaleStatus {
  PENDING = "pending",
  APPROVED = "confirmed",
  REJECTED = "declined",
}

export enum Currency {
  INR = "INR",
  USD = "USD",
}

@Entity()
export class AffiliateNetwork {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true, nullable: false })
  name: string;

  @Column({ nullable: false })
  shortname: string;

  @Column({ nullable: false })
  namespace: string;

  @Column({ nullable: true })
  affiliateId: string;

  @Column({ nullable: true })
  websiteId: number;

  @Column({ nullable: false })
  confirmDays: number;

  @Column({ nullable: false })
  enabled: boolean;

  @Column({ type: "enum", enum: Currency, default: Currency.INR })
  currency: Currency;

  @Column({ nullable: true })
  directMerchant: string;

  @Column({ type: "json", nullable: true })
  campaignStatuses: any;

  @Column({ nullable: true })
  campaignInfoUrl: string;

  @Column({ type: "json" })
  saleStatuses: any;

  @Column({ type: "json", nullable: true })
  columnsUpdate: any;

  @Column({ nullable: true })
  apiKey: string;

  @Column({ type: "json", nullable: true })
  authTokens: any;

  @Column({ type: "json", nullable: true })
  credentials: any;

  @Column({ nullable: true })
  networkPlatform: string;

  @Column({ nullable: true })
  Subids: string;

  @Column({ type: "json", nullable: true })
  networkSubids: any;

  @OneToMany(() => PostbackLog, (postbackLog) => postbackLog.network_id)
  postbackLogs: PostbackLog[];

  @OneToMany(() => Store, (store) => store.network)
  stores: Store[];

  @OneToMany(() => CashbackTxn, (cashbackTxn) => cashbackTxn.network_id,
    {onDelete: 'CASCADE', onUpdate: 'CASCADE', eager: true}
  )
  cashbackTxns: CashbackTxn[];

  @OneToMany(() => CashbackTxn, (salesTxn) => salesTxn.network_id,
    {onDelete: 'CASCADE', onUpdate: 'CASCADE', eager: true}
  )
  salesTxns: SalesTxn[];

  @OneToMany(() => MockTxn, (mockTxn) => mockTxn.network_id, {
    onDelete: "NO ACTION",
    onUpdate: "CASCADE",
    eager: true,
  })
  mockTxns: MockTxn[];

  @OneToMany(() => Clicks, (clicks) => clicks.network, {
    onDelete: "NO ACTION",
    onUpdate: "NO ACTION",
  })
  clicks: Clicks[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
