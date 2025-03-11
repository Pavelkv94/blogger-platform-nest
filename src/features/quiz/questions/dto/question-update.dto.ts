import { ApiProperty } from '@nestjs/swagger';
import { QuestionCreateDto } from './question-create.dto';

export class QuestionUpdateDto extends QuestionCreateDto {}

export class QuestionPublishDto {
  @ApiProperty({ description: 'Published status' })
  published: boolean;
}
