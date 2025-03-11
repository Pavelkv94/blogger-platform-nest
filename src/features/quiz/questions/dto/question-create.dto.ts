import { ApiProperty } from '@nestjs/swagger';
import { IsArray } from 'class-validator';
import { IsNotEmptyString } from '../../../../core/decorators/validation/IsNotEmptyString';

export class QuestionCreateDto {
  @ApiProperty({ example: 'Question Body' })
  @IsNotEmptyString()
  body: string;

  @ApiProperty({ example: 'Correct Answers' })
  @IsArray()
  correctAnswers: Array<string | number>;
}
