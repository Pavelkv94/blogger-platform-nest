import { INestApplication } from "@nestjs/common";
import { AllExceptionsFilter } from "../core/exeptions/filters/all-exceptions-filter";
import { DomainExceptionsFilter } from "../core/exeptions/filters/domain-exceptions-filter"; 
import { CoreConfig } from "../core/core.config";

export function exceptionFilterSetup(app: INestApplication, coreConfig: CoreConfig) {
  //Подключаем наши фильтры. Тут важна последовательность! (сработает справа на лево)
  app.useGlobalFilters(new AllExceptionsFilter(coreConfig), new DomainExceptionsFilter());
  // app.useGlobalFilters(new SimpleExeptionFilter());

}
