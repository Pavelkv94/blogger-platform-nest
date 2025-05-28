import { Answer } from '../domain/answer.entity';

export class AnswerViewDto {
  answerStatus: string;
  questionId: number;
  addedAt: Date;

  constructor(model: any) {
    if (model instanceof Answer) {
      this.answerStatus = model.answerStatus;
      this.questionId = model.questionId;
      this.addedAt = model.addedAt;
    } else {
      // Handle raw query results
      this.answerStatus = model.answer_answerStatus;
      this.questionId = model.answer_questionId;
      this.addedAt = model.answer_addedAt;
    }
  }

  static mapToView(answer: Answer): AnswerViewDto {
    return new AnswerViewDto(answer);
  }
}
