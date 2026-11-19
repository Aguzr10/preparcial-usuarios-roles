import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateUsersAndRoles1795062310765 implements MigrationInterface {
  name = 'CreateUsersAndRoles1795062310765';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE roles (
        id          UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
        role_name   VARCHAR(50)  NOT NULL UNIQUE,
        description VARCHAR(255)
      )
    `);

    await queryRunner.query(`
      CREATE TABLE users (
        id         UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
        email      VARCHAR(255) NOT NULL UNIQUE,
        password   VARCHAR(255) NOT NULL,
        name       VARCHAR(100),
        phone      VARCHAR(20),
        is_active  BOOLEAN      NOT NULL DEFAULT TRUE,
        created_at TIMESTAMP    NOT NULL DEFAULT now()
      )
    `);

    // Tabla intermedia de la relación muchos a muchos.
    // Si se borra un usuario o un rol, sus filas aquí se borran solas.
    await queryRunner.query(`
      CREATE TABLE user_roles (
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
        PRIMARY KEY (user_id, role_id)
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Al revés de como se crearon: primero la que depende de las otras dos
    await queryRunner.query(`DROP TABLE user_roles`);
    await queryRunner.query(`DROP TABLE users`);
    await queryRunner.query(`DROP TABLE roles`);
  }
}
