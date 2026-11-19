import { DataSource } from 'typeorm';

// Conexión que usa el CLI de TypeORM para correr las migraciones.
// Corre fuera de Nest, así que lee el .env con la función nativa de Node.
process.loadEnvFile('.env');

export default new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  username: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  entities: ['dist/**/*.entity.js'],
  migrations: ['dist/migrations/*.js'],
});
