import {MigrationInterface, QueryRunner} from "typeorm";

export class updatePostbackMigration1642708886001 implements MigrationInterface {
    name = 'updatePostbackMigration1642708886001'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "postback_log" DROP COLUMN "networkCampaignId"`);
        await queryRunner.query(`ALTER TABLE "postback_log" ADD "networkCampaignId" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "postback_log" DROP COLUMN "commissionId"`);
        await queryRunner.query(`ALTER TABLE "postback_log" ADD "commissionId" character varying`);
        await queryRunner.query(`ALTER TABLE "postback_log" DROP CONSTRAINT "UQ_a206284d5ae760dbe0a6b6487df"`);
        await queryRunner.query(`ALTER TABLE "postback_log" DROP COLUMN "orderId"`);
        await queryRunner.query(`ALTER TABLE "postback_log" ADD "orderId" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "postback_log" ADD CONSTRAINT "UQ_a206284d5ae760dbe0a6b6487df" UNIQUE ("orderId")`);
        await queryRunner.query(`ALTER TABLE "postback_log" DROP COLUMN "affSub1"`);
        await queryRunner.query(`ALTER TABLE "postback_log" ADD "affSub1" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "postback_log" DROP COLUMN "affSub2"`);
        await queryRunner.query(`ALTER TABLE "postback_log" ADD "affSub2" character varying`);
        await queryRunner.query(`ALTER TABLE "postback_log" DROP COLUMN "affSub3"`);
        await queryRunner.query(`ALTER TABLE "postback_log" ADD "affSub3" character varying`);
        await queryRunner.query(`ALTER TABLE "postback_log" DROP COLUMN "affSub4"`);
        await queryRunner.query(`ALTER TABLE "postback_log" ADD "affSub4" character varying`);
        await queryRunner.query(`ALTER TABLE "postback_log" DROP COLUMN "affSub5"`);
        await queryRunner.query(`ALTER TABLE "postback_log" ADD "affSub5" character varying`);
        await queryRunner.query(`ALTER TABLE "postback_log" DROP CONSTRAINT "UQ_a43392c468b73e7095e1f70642b"`);
        await queryRunner.query(`ALTER TABLE "postback_log" DROP COLUMN "SaleId"`);
        await queryRunner.query(`ALTER TABLE "postback_log" ADD "SaleId" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "postback_log" ADD CONSTRAINT "UQ_a43392c468b73e7095e1f70642b" UNIQUE ("SaleId")`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "postback_log" DROP CONSTRAINT "UQ_a43392c468b73e7095e1f70642b"`);
        await queryRunner.query(`ALTER TABLE "postback_log" DROP COLUMN "SaleId"`);
        await queryRunner.query(`ALTER TABLE "postback_log" ADD "SaleId" integer NOT NULL`);
        await queryRunner.query(`ALTER TABLE "postback_log" ADD CONSTRAINT "UQ_a43392c468b73e7095e1f70642b" UNIQUE ("SaleId")`);
        await queryRunner.query(`ALTER TABLE "postback_log" DROP COLUMN "affSub5"`);
        await queryRunner.query(`ALTER TABLE "postback_log" ADD "affSub5" integer`);
        await queryRunner.query(`ALTER TABLE "postback_log" DROP COLUMN "affSub4"`);
        await queryRunner.query(`ALTER TABLE "postback_log" ADD "affSub4" integer`);
        await queryRunner.query(`ALTER TABLE "postback_log" DROP COLUMN "affSub3"`);
        await queryRunner.query(`ALTER TABLE "postback_log" ADD "affSub3" integer`);
        await queryRunner.query(`ALTER TABLE "postback_log" DROP COLUMN "affSub2"`);
        await queryRunner.query(`ALTER TABLE "postback_log" ADD "affSub2" integer`);
        await queryRunner.query(`ALTER TABLE "postback_log" DROP COLUMN "affSub1"`);
        await queryRunner.query(`ALTER TABLE "postback_log" ADD "affSub1" integer NOT NULL`);
        await queryRunner.query(`ALTER TABLE "postback_log" DROP CONSTRAINT "UQ_a206284d5ae760dbe0a6b6487df"`);
        await queryRunner.query(`ALTER TABLE "postback_log" DROP COLUMN "orderId"`);
        await queryRunner.query(`ALTER TABLE "postback_log" ADD "orderId" integer NOT NULL`);
        await queryRunner.query(`ALTER TABLE "postback_log" ADD CONSTRAINT "UQ_a206284d5ae760dbe0a6b6487df" UNIQUE ("orderId")`);
        await queryRunner.query(`ALTER TABLE "postback_log" DROP COLUMN "commissionId"`);
        await queryRunner.query(`ALTER TABLE "postback_log" ADD "commissionId" integer`);
        await queryRunner.query(`ALTER TABLE "postback_log" DROP COLUMN "networkCampaignId"`);
        await queryRunner.query(`ALTER TABLE "postback_log" ADD "networkCampaignId" integer NOT NULL`);
    }

}
