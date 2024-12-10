import { INestApplication } from '@nestjs/common';
import { pipesSetup } from './pipes.setup';
import { swaggerSetup } from './swagger.setup';
import { exceptionFilterSetup } from './exception-filter.setup';

export function configApp(app: INestApplication) {
  pipesSetup(app);
  // globalPrefixSetup(app);
  swaggerSetup(app);
  exceptionFilterSetup(app);

  app.enableCors({
    origin: '*',
  });
}
