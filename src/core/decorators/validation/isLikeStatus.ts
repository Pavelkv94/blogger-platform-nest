import { registerDecorator, ValidationOptions } from 'class-validator';
import { LikeStatus } from 'src/features/bloggers-platform/likes/dto/like-status.dto';

export function IsLikeStatus(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'IsLikeStatus',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any) {
          return value === LikeStatus.Dislike || value === LikeStatus.Like || value === LikeStatus.None;
        },
        defaultMessage() {
          return `${propertyName} must be one of the following: ${LikeStatus.Dislike}, ${LikeStatus.Like}, or ${LikeStatus.None}`;
        },
      },
    });
  };
}
