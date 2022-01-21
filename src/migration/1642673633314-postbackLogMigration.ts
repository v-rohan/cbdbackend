import {MigrationInterface, QueryRunner} from "typeorm";

export class postbackLogMigration1642673633314 implements MigrationInterface {
    name = 'postbackLogMigration1642673633314'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "postback_log" ("id" SERIAL NOT NULL, "networkCampaignId" integer NOT NULL, "transactionId" character varying NOT NULL, "commissionId" integer, "orderId" integer NOT NULL, "saleDate" TIMESTAMP WITH TIME ZONE NOT NULL, "saleAmount" numeric NOT NULL, "baseCommission" numeric NOT NULL, "currency" character varying NOT NULL, "saleStatus" character varying NOT NULL, "affSub1" integer NOT NULL, "affSub2" integer, "affSub3" integer, "affSub4" integer, "affSub5" integer, "SaleId" integer NOT NULL, "Exception" character varying, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "affiliateNetworkId" integer, CONSTRAINT "UQ_ddd793d80dc77a618a867276ad4" UNIQUE ("transactionId"), CONSTRAINT "UQ_a206284d5ae760dbe0a6b6487df" UNIQUE ("orderId"), CONSTRAINT "UQ_a43392c468b73e7095e1f70642b" UNIQUE ("SaleId"), CONSTRAINT "PK_32344cfbda53e6ee6262577da6c" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."affiliate_network_currency_enum" AS ENUM('INR', 'USD')`);
        await queryRunner.query(`CREATE TABLE "affiliate_network" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "shortname" character varying NOT NULL, "namespace" character varying NOT NULL, "affiliateId" integer, "websiteId" integer, "confirmDays" integer NOT NULL, "enabled" boolean NOT NULL, "currency" "public"."affiliate_network_currency_enum" NOT NULL DEFAULT 'INR', "directMerchant" character varying, "campaignStatuses" character varying, "campaignInfoUrl" character varying, "saleStatus" json NOT NULL, "columnsUpdate" json, "apiKey" character varying, "authTokens" json, "credentials" json, "networkPlatform" character varying, "Subids" character varying, "networkSubids" json, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_587ace832b7374bb56d2817eb81" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."user_role_enum" AS ENUM('admin', 'user')`);
        await queryRunner.query(`CREATE TABLE "user" ("id" SERIAL NOT NULL, "firstName" character varying, "lastName" character varying, "email" character varying NOT NULL, "password" character varying NOT NULL, "role" "public"."user_role_enum" NOT NULL DEFAULT 'user', CONSTRAINT "UQ_e12875dfb3b1d92d7d7c5377e22" UNIQUE ("email"), CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "postback_log" ADD CONSTRAINT "FK_bea18a429f9a013ba3f1c30839f" FOREIGN KEY ("affiliateNetworkId") REFERENCES "affiliate_network"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "postback_log" DROP CONSTRAINT "FK_bea18a429f9a013ba3f1c30839f"`);
        await queryRunner.query(`DROP TABLE "user"`);
        await queryRunner.query(`DROP TYPE "public"."user_role_enum"`);
        await queryRunner.query(`DROP TABLE "affiliate_network"`);
        await queryRunner.query(`DROP TYPE "public"."affiliate_network_currency_enum"`);
        await queryRunner.query(`DROP TABLE "postback_log"`);
    }

}
