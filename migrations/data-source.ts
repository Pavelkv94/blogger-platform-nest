import { DataSource } from 'typeorm';

export default new DataSource({
  type: 'postgres',
  host: 'localhost', // Адрес вашего сервера PostgreSQL
  port: 5432, // Порт по умолчанию
  username: 'admin', // Ваше имя пользователя
  password: 'admin', // Ваш пароль
  database: 'migro2', // Имя новой базы данных
  migrations: [__dirname + '/data/**/*{.ts,.js}'],
  entities: ['src/**/*.entity{.ts,.js}'], // Здесь укажите ваши сущности
});
