import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { AffiliateNetwork } from "./AffiliateNetwork";

@Entity()
export class PostbackLog {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(
    () => AffiliateNetwork,
    (affiliateNetwork) => affiliateNetwork.postbackLogs,
    { onDelete: "NO ACTION", onUpdate: "NO ACTION" }
  )
  affiliateNetwork: AffiliateNetwork;

  @Column({ nullable: false })
  networkCampaignId: string;

  @Column({ nullable: false, unique: true })
  transactionId: string;

  @Column({ nullable: true })
  commissionId: string;

  @Column({ nullable: false, unique: true })
  orderId: string;

  @Column({ type: "timestamptz", nullable: false })
  saleDate: Date;

  @Column({ type: "decimal", nullable: false })
  saleAmount: number;

  @Column({ type: "decimal", nullable: false })
  baseCommission: number;

  @Column({ nullable: false })
  currency: string;

  @Column({ nullable: false })
  saleStatus: string;

  @Column()
  affSub1: string;

  @Column({ nullable: true })
  affSub2: string;

  @Column({ nullable: true })
  affSub3: string;

  @Column({ nullable: true })
  affSub4: string;

  @Column({ nullable: true })
  affSub5: string;

  @Column({ nullable: false, unique: true })
  SaleId: string;

  @Column({ nullable: true })
  Exception: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
