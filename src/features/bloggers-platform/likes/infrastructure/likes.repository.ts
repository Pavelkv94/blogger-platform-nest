import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { LikeStatus } from '../dto/like-status.dto';
import { LikeParent } from '../dto/like-parent.dto';
import { Like } from '../domain/like.entity';
@Injectable()
export class LikesRepository {
  constructor(@InjectRepository(Like) private likeRepositoryTypeOrm: Repository<Like>) {}

  async findLike(userId: string, parent_id: string): Promise<any | null> {
    const like = await this.likeRepositoryTypeOrm.findOne({
      where: {
        userId: Number(userId),
        parentId: Number(parent_id),
      },
    });

    if (!like) {
      return null;
    }
    return like;
  }

  async createLike(parent_id: string, userId: string, newStatus: LikeStatus, parentType: LikeParent): Promise<void> {
    const like = Like.buildInstance(parentType, parent_id, userId, newStatus);
    await this.likeRepositoryTypeOrm.save(like);
  }

  async updateLike(like: Like, newStatus: LikeStatus): Promise<void> {
    like.update(newStatus);
    await this.likeRepositoryTypeOrm.save(like);
  }
}
