import { ApiProperty } from '@nestjs/swagger';
import { IsArray, Length } from 'class-validator';
import { IsNotEmptyString } from '../../../../core/decorators/validation/IsNotEmptyString';

export class QuestionCreateDto {
  @ApiProperty({ example: 'Question Body' })
  @IsNotEmptyString()
  @Length(10, 500)
  body: string;

  @ApiProperty({ example: 'Correct Answers' })
  @IsArray()
  correctAnswers: Array<string | number>;
}
