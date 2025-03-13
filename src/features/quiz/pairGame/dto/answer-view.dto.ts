import { Answer } from '../domain/answer.entity';

export class AnswerViewDto {
  answerStatus: string;
  questionId: number;
  addedAt: Date;

  constructor(model: any) {
    this.answerStatus = model.answer_answerStatus;
    this.questionId = model.answer_questionId;
    this.addedAt = model.answer_addedAt;
  }

  static mapToView(answer: Answer): AnswerViewDto {
    return new AnswerViewDto(answer);
  }
}
