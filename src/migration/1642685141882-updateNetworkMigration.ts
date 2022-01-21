import {MigrationInterface, QueryRunner} from "typeorm";

export class updateNetworkMigration1642685141882 implements MigrationInterface {
    name = 'updateNetworkMigration1642685141882'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "affiliate_network" DROP COLUMN "saleStatus"`);
        await queryRunner.query(`ALTER TABLE "affiliate_network" ADD "saleStatuses" json NOT NULL`);
        await queryRunner.query(`ALTER TABLE "affiliate_network" DROP COLUMN "affiliateId"`);
        await queryRunner.query(`ALTER TABLE "affiliate_network" ADD "affiliateId" character varying`);
        await queryRunner.query(`ALTER TABLE "affiliate_network" DROP COLUMN "campaignStatuses"`);
        await queryRunner.query(`ALTER TABLE "affiliate_network" ADD "campaignStatuses" json`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "affiliate_network" DROP COLUMN "campaignStatuses"`);
        await queryRunner.query(`ALTER TABLE "affiliate_network" ADD "campaignStatuses" character varying`);
        await queryRunner.query(`ALTER TABLE "affiliate_network" DROP COLUMN "affiliateId"`);
        await queryRunner.query(`ALTER TABLE "affiliate_network" ADD "affiliateId" integer`);
        await queryRunner.query(`ALTER TABLE "affiliate_network" DROP COLUMN "saleStatuses"`);
        await queryRunner.query(`ALTER TABLE "affiliate_network" ADD "saleStatus" json NOT NULL`);
    }

}
