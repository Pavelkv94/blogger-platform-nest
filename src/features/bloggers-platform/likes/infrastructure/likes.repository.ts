import { Injectable } from '@nestjs/common';
import { LikeDocument, LikeEntity, LikeModelType } from '../domain/like.entity';
import { InjectModel } from '@nestjs/mongoose';

@Injectable()
export class LikesRepository {
  constructor(@InjectModel(LikeEntity.name) private LikeModel: LikeModelType) {}

  async findLike(userId: string, parent_id: string): Promise<LikeDocument | null> {
    const likeDocument = await this.LikeModel.findOne({ user_id: userId, parent_id: parent_id });

    if (!likeDocument) {
      return null;
    }
    return likeDocument;
  }

  async save(like: LikeDocument): Promise<void> {
    await like.save();
  }
}
