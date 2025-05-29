import { Answer } from '../domain/answer.entity';

export class AnswerViewDto {
  answerStatus: string;
  questionId: string;
  addedAt: Date;

  constructor(model: any) {
    if (model instanceof Answer) {
      this.addedAt = model.addedAt;
      this.answerStatus = model.answerStatus;
      this.questionId = model.questionId;
    } else {
      this.addedAt = model.answer_addedAt;
      this.answerStatus = model.answer_answerStatus;
      this.questionId = model.answer_questionId;
    }
  }

  static mapToView(answer: Answer): AnswerViewDto {
    return new AnswerViewDto(answer);
  }
}
