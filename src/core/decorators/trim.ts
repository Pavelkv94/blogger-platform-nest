import { Transform, TransformFnParams } from 'class-transformer';

// Декоратор @Transform из библиотеки class-transformer в связке с class-validator
// позволяет преобразовывать данные перед их валидацией. Это полезно, когда входные данные
// могут приходить в разных форматах, и их нужно привести к определённому виду перед проверкой.

export const Trim = () => Transform(({ value }: TransformFnParams) => (typeof value === 'string' ? value.trim() : value));
