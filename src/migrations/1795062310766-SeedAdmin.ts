import { MigrationInterface, QueryRunner } from 'typeorm';

// Crea el rol admin y el primer usuario admin.
// Usuario: admin@admin.com / Contraseña: webparcial2611
// El hash se generó con el PasswordHasher de @nestjs/authentication (scrypt),
// el mismo que verifica el login. Con otro algoritmo el admin no podría entrar.
const ADMIN_PASSWORD_HASH =
  '$scrypt$ln=17,r=8,p=1$w/FEejbbVgK37qdPDRycdA$gKcuqc4/NvhjZO22IzZy3JiB4WA6myU1vwaIaF4pRm4';

export class SeedAdmin1795062310766 implements MigrationInterface {
  name = 'SeedAdmin1795062310766';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `INSERT INTO roles (role_name, description) VALUES ($1, $2)`,
      ['admin', 'Administrador: acceso total'],
    );

    await queryRunner.query(
      `INSERT INTO users (email, password, name) VALUES ($1, $2, $3)`,
      ['admin@admin.com', ADMIN_PASSWORD_HASH, 'Administrador'],
    );

    // Une al usuario con el rol buscando los dos uuid por nombre
    await queryRunner.query(`
      INSERT INTO user_roles (user_id, role_id)
      SELECT u.id, r.id
      FROM users u, roles r
      WHERE u.email = 'admin@admin.com' AND r.role_name = 'admin'
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // ON DELETE CASCADE borra la fila de user_roles
    await queryRunner.query(`DELETE FROM users WHERE email = $1`, [
      'admin@admin.com',
    ]);
    await queryRunner.query(`DELETE FROM roles WHERE role_name = $1`, [
      'admin',
    ]);
  }
}
