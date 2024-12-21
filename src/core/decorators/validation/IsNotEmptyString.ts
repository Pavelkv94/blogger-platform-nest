import { registerDecorator, ValidationOptions } from 'class-validator';

export function IsNotEmptyString(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isNotEmptyString',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any) {
          return typeof value === 'string' && value.trim() !== '';
        },
        defaultMessage() {
          return `${propertyName} should not be empty or whitespace only`;
        },
      },
    });
  };
}
