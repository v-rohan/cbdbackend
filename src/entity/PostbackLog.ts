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
  network_id: AffiliateNetwork;

  @Column({ nullable: true })
  network_campaign_id: string;

  @Column({ nullable: false, unique: true })
  transaction_id: string;

  @Column({ nullable: true })
  commission_id: string;

  @Column({ nullable: true})
  order_id: string;

  @Column({ nullable: true })
  sale_date: string;

  @Column({ type: "decimal", nullable: false })
  sale_amount: number;

  @Column({ type: "decimal", nullable: false })
  base_commission: number;

  @Column({ nullable: false })
  currency: string;

  @Column({ nullable: false })
  status: string;

  @Column({unique: true})
  aff_sub1: Number;

  @Column({ nullable: true })
  aff_sub2: string;

  @Column({ nullable: true })
  aff_sub3: string;

  @Column({ nullable: true })
  aff_sub4: string;

  @Column({ nullable: true })
  aff_sub5: string;

  @Column({ nullable: true, unique: false })
  sale_id: string;

  @Column({ nullable: true })
  exception: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
