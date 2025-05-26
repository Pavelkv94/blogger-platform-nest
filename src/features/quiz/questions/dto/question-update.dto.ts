import { ApiProperty } from '@nestjs/swagger';
import { QuestionCreateDto } from './question-create.dto';
import { IsBoolean } from 'class-validator';

export class QuestionUpdateDto extends QuestionCreateDto {}

export class QuestionPublishDto {
  @ApiProperty({ description: 'Published status' })
  @IsBoolean()
  published: boolean;
}
