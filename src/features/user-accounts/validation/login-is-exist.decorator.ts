import { Injectable } from '@nestjs/common';
import { registerDecorator, ValidationArguments, ValidationOptions, ValidatorConstraint, ValidatorConstraintInterface } from 'class-validator';
import { UsersRepository } from 'src/features/user-accounts/infrastructure/users.repository';

// Внимание! Используем такой подход только в исключительных случаях.
// Данный пример служит для демонстрации.
// Такую проверку делаем в BLL.
// В домашнем задании этот способ применим при создании поста,
// когда blogId передается в body. Для формирования общего массива ошибок.

@ValidatorConstraint({ name: 'LoginIsExist', async: true })
@Injectable()
export class LoginIsExistConstraint implements ValidatorConstraintInterface {
  constructor(private readonly usersRepository: UsersRepository) {}
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async validate(value: any, args: ValidationArguments) {
    const loginIsExist = await this.usersRepository.findUserById(value);
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
