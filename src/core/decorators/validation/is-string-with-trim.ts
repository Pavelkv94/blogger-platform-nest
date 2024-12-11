import { applyDecorators } from '@nestjs/common';
import { IsString, Length } from 'class-validator';
import { Trim } from '../transform/trim';

// Объединение декораторов
// https://docs.nestjs.com/custom-decorators#decorator-composition
export const IsStringWithTrim = (minLength: number, maxLength: number) =>
  applyDecorators(IsString(), Length(minLength, maxLength), Trim());
