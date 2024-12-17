//* all logic is in the usecases
// import { Injectable } from '@nestjs/common';
// import { InjectModel } from '@nestjs/mongoose';
// import { BlogDocument, BlogEntity, BlogModelType } from '../domain/blog.entity';
// import { BlogsRepository } from '../infrastructure/blogs.repository';
// import { BlogUpdateDto } from '../dto/blog-update.dto';

// @Injectable()
// export class BlogsService {
//   constructor(
//     private readonly blogsRepository: BlogsRepository,
//     @InjectModel(BlogEntity.name) private BlogModel: BlogModelType,
//   ) {}

//   async findById(id: string): Promise<BlogDocument> {
//     return this.blogsRepository.findBlogByIdOrNotFoundFail(id);
//   }

//   // async createBlog(createDto: BlogCreateDto): Promise<string> {
//   //   const newUser = this.BlogModel.buildInstance(createDto);

//   //   await this.blogsRepository.save(newUser);

//   //   return newUser._id.toString();
//   // }

//   // async updateBlog(id: string, updateDto: BlogUpdateDto): Promise<void> {
//   //   const blog = await this.blogsRepository.findBlogByIdOrNotFoundFail(id);

//   //   blog.update(updateDto);

//   //   await this.blogsRepository.save(blog);
//   // }

//   // async deleteBlog(id: string): Promise<void> {
//   //   const blog = await this.blogsRepository.findBlogByIdOrNotFoundFail(id);

//   //   blog.makeDeleted();

//   //   await this.blogsRepository.save(blog);
//   // }
// }
