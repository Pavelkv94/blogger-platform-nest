import { DataSource } from 'typeorm';
import { config } from 'dotenv';

config({
  path: [
    // high priority
    ...(process.env.ENV_FILE_PATH ? [process.env.ENV_FILE_PATH.trim()] : []),
    // lower priority
    `.env.${process.env.NODE_ENV}.local`,
    // lower priority
    `.env.${process.env.NODE_ENV}`,
    // lower priority
    '.env.production',
  ]
});

export default new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST, // Адрес вашего сервера PostgreSQL
  port: 5432, // Порт по умолчанию
  username: process.env.DB_USERNAME, // Ваше имя пользователя
  password: process.env.DB_PASSWORD, // Ваш пароль
  database: process.env.DB_NAME, // Имя новой базы данных
  migrations: [__dirname + '/data/**/*{.ts,.js}'],
  entities: ['src/**/*.entity{.ts,.js}'], // Здесь укажите ваши сущности
});
