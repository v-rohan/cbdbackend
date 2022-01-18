import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";

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

  @Column({ nullable: false })
  name: string;

  @Column({ nullable: false })
  shortname: string;

  @Column({ nullable: false })
  namespace: string;

  @Column({ nullable: true })
  affiliateId: number;

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

  @Column({ nullable: true })
  campaignStatuses: string;

  @Column({ nullable: true })
  campaignInfoUrl: string;

  @Column({ type: "enum", enum: SaleStatus, default: SaleStatus.PENDING })
  saleStatus: SaleStatus;

  @Column({ nullable: true })
  columnsUpdate: string;

  @Column({ nullable: true })
  apiKey: string;

  @Column({ nullable: true })
  authTokens: string;

  @Column({ nullable: true })
  credentials: string;

  @Column({ nullable: true })
  networkPlatform: string;

  @Column({ nullable: true })
  Subids: string;

  @Column({ nullable: true })
  networkSubids: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
