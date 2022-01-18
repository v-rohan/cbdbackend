import {MigrationInterface, QueryRunner} from "typeorm";

export class NetworkMigration1642500575261 implements MigrationInterface {
    name = 'NetworkMigration1642500575261'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."affiliate_network_currency_enum" AS ENUM('INR', 'USD')`);
        await queryRunner.query(`CREATE TYPE "public"."affiliate_network_salestatus_enum" AS ENUM('pending', 'confirmed', 'declined')`);
        await queryRunner.query(`CREATE TABLE "affiliate_network" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "shortname" character varying NOT NULL, "namespace" character varying NOT NULL, "affiliateId" integer, "websiteId" integer, "confirmDays" integer NOT NULL, "enabled" boolean NOT NULL, "currency" "public"."affiliate_network_currency_enum" NOT NULL DEFAULT 'INR', "directMerchant" character varying, "campaignStatuses" character varying, "campaignInfoUrl" character varying, "saleStatus" "public"."affiliate_network_salestatus_enum" NOT NULL DEFAULT 'pending', "columnsUpdate" character varying, "apiKey" character varying, "authTokens" character varying, "credentials" character varying, "networkPlatform" character varying, "Subids" character varying, "networkSubids" character varying, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_587ace832b7374bb56d2817eb81" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."user_role_enum" AS ENUM('admin', 'user')`);
        await queryRunner.query(`CREATE TABLE "user" ("id" SERIAL NOT NULL, "firstName" character varying, "lastName" character varying, "email" character varying NOT NULL, "password" character varying NOT NULL, "role" "public"."user_role_enum" NOT NULL DEFAULT 'user', CONSTRAINT "UQ_e12875dfb3b1d92d7d7c5377e22" UNIQUE ("email"), CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "user"`);
        await queryRunner.query(`DROP TYPE "public"."user_role_enum"`);
        await queryRunner.query(`DROP TABLE "affiliate_network"`);
        await queryRunner.query(`DROP TYPE "public"."affiliate_network_salestatus_enum"`);
        await queryRunner.query(`DROP TYPE "public"."affiliate_network_currency_enum"`);
    }

}
