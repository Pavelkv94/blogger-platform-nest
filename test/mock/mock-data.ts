import { BlogCreateDto } from 'src/features/bloggers-platform/blogs/dto/blog-create.dto';
import { BlogUpdateDto } from 'src/features/bloggers-platform/blogs/dto/blog-update.dto';
import { CreatePostForBlogDto } from 'src/features/bloggers-platform/posts/dto/post-create.dto';
import { UpdatePostDto } from 'src/features/bloggers-platform/posts/dto/post-update.dto';
import { CreateUserDto } from 'src/features/user-accounts/dto/users/create-user.dto';

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
