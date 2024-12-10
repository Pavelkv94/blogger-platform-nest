import { INestApplication } from "@nestjs/common";
import { AllExceptionsFilter } from "src/core/exeptions/filters/all-exceptions-filter";
import { DomainExceptionsFilter } from "src/core/exeptions/filters/domain-exceptions-filter"; 

export function exceptionFilterSetup(app: INestApplication) {
  //Подключаем наши фильтры. Тут важна последовательность! (сработает справа на лево)
  app.useGlobalFilters(new AllExceptionsFilter(), new DomainExceptionsFilter());
}
