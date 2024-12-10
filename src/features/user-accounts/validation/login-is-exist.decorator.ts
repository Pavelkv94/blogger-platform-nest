import { Injectable } from '@nestjs/common';
import { registerDecorator, ValidationArguments, ValidationOptions, ValidatorConstraint, ValidatorConstraintInterface } from 'class-validator';
import { UsersRepository } from '../infrastructure/users.repository';

// Обязательна регистрация в ioc

// Внимание! Используем такой подход только в исключительных случаях.
// Данный пример служит для демонстрации.
// Такую проверку делаем в BLL.
// В домашнем задании этот способ применим при создании поста,
// когда blogId передается в body. Для формирования общего массива ошибок.

//! Вопрос - как делать проверку на уникальность логина?

@ValidatorConstraint({ name: 'LoginIsExist', async: true })
@Injectable()
export class LoginIsExistConstraint implements ValidatorConstraintInterface {
  constructor(private readonly usersRepository: UsersRepository) {}
  async validate(value: string) {
    const loginIsExist = await this.usersRepository.loginIsExist(value);
    return !loginIsExist;
  }

  defaultMessage(validationArguments?: ValidationArguments): string {
    return `Login ${validationArguments?.value} already exist`;
  }
}

// https://github.com/typestack/class-validator?tab=readme-ov-file#custom-validation-decorators
export function LoginIsExist(property?: string, validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [property],
      validator: LoginIsExistConstraint,
    });
  };
}
