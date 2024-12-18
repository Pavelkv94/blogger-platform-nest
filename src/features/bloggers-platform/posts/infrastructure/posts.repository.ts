import { Injectable } from '@nestjs/common';
import { PostDocument, PostEntity, PostModelType } from '../domain/post.entity';
import { InjectModel } from '@nestjs/mongoose';
import { DeletionStatus } from 'src/core/dto/deletion-status';

@Injectable()
export class PostsRepository {
  constructor(@InjectModel(PostEntity.name) private PostModel: PostModelType) {}

  async findPostById(id: string): Promise<PostDocument | null> {
    const post = await this.PostModel.findOne({
      _id: id,
      deletionStatus: DeletionStatus.NotDeleted,
    });
    if (!post) {
      return null
      // throw NotFoundDomainException.create('Post not found');
    }
    return post;
  }

  async save(post: PostDocument): Promise<void> {
    await post.save();
  }
}
