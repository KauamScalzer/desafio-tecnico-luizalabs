import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialDatabase20250805093742 implements MigrationInterface {
  name = 'InitialDatabase20250805093742';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "products" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "legacy_product_id" integer NOT NULL, "value" decimal(12,2) NOT NULL, "order_id" integer NOT NULL)`,
    );
    await queryRunner.query(
      `CREATE TABLE "orders" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "legacy_order_id" integer NOT NULL, "date" text NOT NULL, "total" decimal(12,2) NOT NULL DEFAULT (0), "user_id" integer NOT NULL)`,
    );
    await queryRunner.query(
      `CREATE TABLE "users" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "legacy_user_id" integer NOT NULL, "name" varchar(45) NOT NULL)`,
    );
    await queryRunner.query(
      `CREATE TABLE "temporary_products" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "legacy_product_id" integer NOT NULL, "value" decimal(12,2) NOT NULL, "order_id" integer NOT NULL, CONSTRAINT "FK_89a3b9463601304d3892116c187" FOREIGN KEY ("order_id") REFERENCES "orders" ("id") ON DELETE CASCADE ON UPDATE CASCADE)`,
    );
    await queryRunner.query(
      `INSERT INTO "temporary_products"("id", "legacy_product_id", "value", "order_id") SELECT "id", "legacy_product_id", "value", "order_id" FROM "products"`,
    );
    await queryRunner.query(`DROP TABLE "products"`);
    await queryRunner.query(
      `ALTER TABLE "temporary_products" RENAME TO "products"`,
    );
    await queryRunner.query(
      `CREATE TABLE "temporary_orders" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "legacy_order_id" integer NOT NULL, "date" text NOT NULL, "total" decimal(12,2) NOT NULL DEFAULT (0), "user_id" integer NOT NULL, CONSTRAINT "FK_a922b820eeef29ac1c6800e826a" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE)`,
    );
    await queryRunner.query(
      `INSERT INTO "temporary_orders"("id", "legacy_order_id", "date", "total", "user_id") SELECT "id", "legacy_order_id", "date", "total", "user_id" FROM "orders"`,
    );
    await queryRunner.query(`DROP TABLE "orders"`);
    await queryRunner.query(
      `ALTER TABLE "temporary_orders" RENAME TO "orders"`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "orders" RENAME TO "temporary_orders"`,
    );
    await queryRunner.query(
      `CREATE TABLE "orders" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "legacy_order_id" integer NOT NULL, "date" text NOT NULL, "total" decimal(12,2) NOT NULL DEFAULT (0), "user_id" integer NOT NULL)`,
    );
    await queryRunner.query(
      `INSERT INTO "orders"("id", "legacy_order_id", "date", "total", "user_id") SELECT "id", "legacy_order_id", "date", "total", "user_id" FROM "temporary_orders"`,
    );
    await queryRunner.query(`DROP TABLE "temporary_orders"`);
    await queryRunner.query(
      `ALTER TABLE "products" RENAME TO "temporary_products"`,
    );
    await queryRunner.query(
      `CREATE TABLE "products" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "legacy_product_id" integer NOT NULL, "value" decimal(12,2) NOT NULL, "order_id" integer NOT NULL)`,
    );
    await queryRunner.query(
      `INSERT INTO "products"("id", "legacy_product_id", "value", "order_id") SELECT "id", "legacy_product_id", "value", "order_id" FROM "temporary_products"`,
    );
    await queryRunner.query(`DROP TABLE "temporary_products"`);
    await queryRunner.query(`DROP TABLE "users"`);
    await queryRunner.query(`DROP TABLE "orders"`);
    await queryRunner.query(`DROP TABLE "products"`);
  }
}
