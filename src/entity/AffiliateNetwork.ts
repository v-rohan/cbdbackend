import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { PostbackLog } from "./PostbackLog";
import { Store } from "./Store";

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

  @OneToMany(() => PostbackLog, (postbackLog) => postbackLog.affiliateNetwork)
  postbackLogs: PostbackLog[];

  @OneToMany(() => Store, (store) => store.network)
  stores: Store[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
