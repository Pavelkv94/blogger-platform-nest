import { ArgumentMetadata, Injectable, PipeTransform } from '@nestjs/common';
import { isValidObjectId, Types } from 'mongoose';
import { BadRequestDomainException } from '../exeptions/domain-exceptions';
// Custom pipe example
// https://docs.nestjs.com/pipes#custom-pipes
@Injectable()
export class ObjectIdValidationPipe implements PipeTransform {
  transform(value: any, metadata: ArgumentMetadata): any {
    // Проверяем, что тип данных в декораторе — ObjectId
    if (metadata.metatype === Types.ObjectId) {
      if (!isValidObjectId(value)) {
        throw BadRequestDomainException.create(`Invalid ObjectId: ${value}`);
      }
      return new Types.ObjectId(value); // Преобразуем строку в ObjectId
    }

    // Если тип не ObjectId, возвращаем значение без изменений
    return value;
  }
}
