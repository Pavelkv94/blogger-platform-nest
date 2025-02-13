import { Inject, Injectable } from '@nestjs/common';
import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { BlogsRepository } from '../../../blogs/infrastructure/blogs.repository';

// Обязательна регистрация в ioc

// Внимание! Используем такой подход только в исключительных случаях.
// Данный пример служит для демонстрации.
// Такую проверку делаем в BLL.
// В домашнем задании этот способ применим при создании поста,
// когда blogId передается в body. Для формирования общего массива ошибок.

@ValidatorConstraint({ name: 'BlogIsNotExist', async: true })
@Injectable()
export class BlogIsNotExistConstraint implements ValidatorConstraintInterface {
  constructor(@Inject(BlogsRepository) private readonly blogsRepository: BlogsRepository) {
  }

  async validate(value: any) {
    const blogIsExist = await this.blogsRepository.findBlogById(value);
    return !!blogIsExist;
  }

  defaultMessage(validationArguments?: ValidationArguments): string {
    return `Blog ${validationArguments?.value} is not exist`;
  }
}

// https://github.com/typestack/class-validator?tab=readme-ov-file#custom-validation-decorators
export function BlogIsNotExist(
  property?: string,
  validationOptions?: ValidationOptions,
) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [property],
      validator: BlogIsNotExistConstraint,
    });
  };
}