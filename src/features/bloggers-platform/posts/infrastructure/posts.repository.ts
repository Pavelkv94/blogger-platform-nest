import { Injectable, NotFoundException } from '@nestjs/common';
import { PostDocument, PostEntity, PostModelType } from '../domain/post.entity';
import { InjectModel } from '@nestjs/mongoose';
import { DeletionStatus } from 'src/core/dto/deletion-status';

@Injectable()
export class PostsRepository {
  constructor(@InjectModel(PostEntity.name) private PostModel: PostModelType) {}

  async findById(id: string): Promise<PostDocument | null> {
    const post = await this.PostModel.findOne({
      _id: id,
      deletionStatus: DeletionStatus.NotDeleted,
    });
    return post || null;
  }

  async findOrNotFoundFail(id: string): Promise<PostDocument> {
    const post = await this.findById(id);
    if (!post) {
      throw new NotFoundException('Post not found');
    }
    return post;
  }
  async save(post: PostDocument): Promise<void> {
    await post.save();
  }
}
