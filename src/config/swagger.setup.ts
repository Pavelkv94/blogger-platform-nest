import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { GLOBAL_PREFIX } from './global-prefix.setup';
import fs from 'fs';
export function swaggerSetup(app: INestApplication) {
  const config = new DocumentBuilder().setTitle('BLOGGER API').addBearerAuth().setVersion('1.0').build();

  const document = SwaggerModule.createDocument(app, config);
  fs.writeFileSync('./docs/swagger.json', JSON.stringify(document));

  SwaggerModule.setup(GLOBAL_PREFIX, app, document, {
    customSiteTitle: 'Blogger Swagger',
  });
}
