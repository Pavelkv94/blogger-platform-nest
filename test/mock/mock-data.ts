import { QuestionCreateDto } from 'src/features/quiz/questions/dto/question-create.dto';
import { BlogCreateDto } from '../../src/features/bloggers-platform/blogs/dto/blog-create.dto';
import { BlogUpdateDto } from '../../src/features/bloggers-platform/blogs/dto/blog-update.dto';
import { CreateCommentInputDto } from '../../src/features/bloggers-platform/comments/dto/create-comment.dto';
import { UpdateCommentInputDto } from '../../src/features/bloggers-platform/comments/dto/update-comment.dto';
import { CreatePostForBlogDto } from '../../src/features/bloggers-platform/posts/dto/post-create.dto';
import { UpdatePostDto } from '../../src/features/bloggers-platform/posts/dto/post-update.dto';
import { CreateUserDto } from '../../src/features/user-accounts/dto/users/create-user.dto';
import { QuestionUpdateDto } from 'src/features/quiz/questions/dto/question-update.dto';

export const mockCreateUserBody: CreateUserDto = {
  login: 'name1',
  password: 'qwerty',
  email: 'email@email.em',
};

export const mockCreateBlogBody: BlogCreateDto = {
  name: 'name1',
  description: 'lorem ipsum dolor sit amet',
  websiteUrl: 'https://www.google.com',
};

export const mockUpdateBlogBody: BlogUpdateDto = {
  name: 'name2',
  description: 'lorem ipsum updated',
  websiteUrl: 'https://www.google.com/updated',
};

export const mockCreatePostBody: CreatePostForBlogDto = {
  title: 'title1',
  shortDescription: 'shortDescription1',
  content: 'content1',
};

export const mockUpdatePostBody: UpdatePostDto = {
  title: 'title2',
  shortDescription: 'shortDescription2',
  content: 'content2',
  blogId: 'blogId',
};

export const mockCreateCommentBody: CreateCommentInputDto = {
  content: 'test comment with long content',
};

export const mockUpdateCommentBody: UpdateCommentInputDto = {
  content: 'updated comment with long content',
};

export const mockCreateQuestionBody: QuestionCreateDto = {
  body: 'test question',
  correctAnswers: ['1', '2', 3, 'four'],
};

export const mockUpdateQuestionBody: QuestionUpdateDto = {
  body: 'updated question',
  correctAnswers: ['one'],
};
export const getLongText = (symbolsCount: number) => {
return 'a'.repeat(symbolsCount);
}
