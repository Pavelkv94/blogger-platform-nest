import { INestApplication } from '@nestjs/common';
import { useContainer } from 'class-validator';
import { AppModule } from '../app.module';

/**
 * Для внедрения зависимостей в validator constraint decorator //* ВАЖНО
 * @param app
 */
export const validationConstraintSetup = (app: INestApplication) => {
  // {fallbackOnErrors: true} требуется, поскольку Nest генерирует исключение,
  // когда DI не имеет необходимого класса.
  useContainer(app.select(AppModule), { fallbackOnErrors: true });
};
