import { INestApplication } from '@nestjs/common';
import { pipesSetup } from './pipes.setup';
import { swaggerSetup } from './swagger.setup';
import { exceptionFilterSetup } from './exception-filter.setup';
import { CoreConfig } from 'src/core/core.config';

export function configApp(app: INestApplication, coreConfig: CoreConfig) {
  pipesSetup(app);
  // globalPrefixSetup(app);
  if (coreConfig.isSwaggerEnabled) {
    swaggerSetup(app);
  }
  exceptionFilterSetup(app, coreConfig);

  app.enableCors({
    origin: '*',
  });
}
