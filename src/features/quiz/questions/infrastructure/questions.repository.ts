import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { QuestionCreateDto } from '../dto/question-create.dto';
import { Question } from '../domain/question.entity';
import { QuestionPublishDto } from '../dto/question-update.dto';

@Injectable()
export class QuestionsRepository {
  constructor(@InjectRepository(Question) private questionRepositoryTypeOrm: Repository<Question>) {}

  async findQuestionById(id: string): Promise<Question | null> {
    const question = await this.questionRepositoryTypeOrm.findOne({ where: { id: Number(id), deletedAt: IsNull() } });
    if (!question) {
      return null;
    }
    return question;
  }

  async createQuestion(payload: QuestionCreateDto): Promise<string> {
    const question = Question.buildInstance(payload.body, payload.correctAnswers);
    const newQuestion = await this.questionRepositoryTypeOrm.save(question);
    return newQuestion.id.toString();
  }

  async updateQuestion(question: Question, payload: QuestionCreateDto): Promise<void> {
    question.update(payload.body, payload.correctAnswers);
    await this.questionRepositoryTypeOrm.save(question);
  }

  async publishQuestion(question: Question, payload: QuestionPublishDto): Promise<void> {
    question.setPublishStatus(payload.published);
    await this.questionRepositoryTypeOrm.save(question);
  }

  async deleteQuestion(question: Question): Promise<void> {
    question.markDeleted();
    await this.questionRepositoryTypeOrm.save(question);
  }

  async getRandomQuestions(): Promise<Question[]> {
    const questions = await this.questionRepositoryTypeOrm.createQueryBuilder('question').orderBy('RANDOM()').take(5).getMany();
    return questions;
  }
}
