import { ApiProperty } from '@nestjs/swagger';
import { Question } from '../domain/question.entity';

export class QuestionViewDto {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  id: string;
  @ApiProperty({ example: 'Question Body' })
  body: string;
  @ApiProperty({ example: 'Correct Answers' })
  correctAnswers: Array<string | number>;
  @ApiProperty({ example: true })
  published: boolean;
  @ApiProperty({ example: new Date() })
  createdAt: Date;
  @ApiProperty({ example: new Date() })
  updatedAt: Date;
  constructor(model: any) {
    this.id = model.id.toString();
    this.body = model.body;
    this.correctAnswers = model.correctAnswers;
    this.published = model.published;
    this.createdAt = model.createdAt;
    this.updatedAt = model.updatedAt;
  }

  static mapToView(question: Question): QuestionViewDto {
    return new QuestionViewDto(question);
  }
}
