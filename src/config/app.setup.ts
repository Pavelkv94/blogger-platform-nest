import { INestApplication } from '@nestjs/common';
import { pipesSetup } from './pipes.setup';
import { swaggerSetup } from './swagger.setup';

export function configApp(app: INestApplication) {
  pipesSetup(app);
  // globalPrefixSetup(app);
  swaggerSetup(app);
}
