import { Injectable } from '@nestjs/common';
// import { LikeDocument, LikeEntity, LikeModelType } from '../domain/like.entity';
import { DataSource } from 'typeorm';
import { InjectDataSource } from '@nestjs/typeorm';
import { LikeStatus } from '../dto/like-status.dto';
import { LikeParent } from '../dto/like-parent.dto';

@Injectable()
export class LikesRepository {
  constructor(@InjectDataSource() private dataSource: DataSource) {}

  async findLike(userId: string, parent_id: string): Promise<any | null> {
    const query = `
      SELECT * FROM likes
      WHERE user_id = $1 AND parent_id = $2
    `
    const likes = await this.dataSource.query(query, [userId, parent_id]);

    if (!likes[0]) {
      return null;
    }
    return likes[0];
  }

  async createLike(parent_id: string, userId: string, newStatus: LikeStatus, parentType: LikeParent): Promise<void> {
    const query = `
      INSERT INTO likes (user_id, parent_id, status, updated_at, parent_type)
      VALUES ($1, $2, $3, NOW(), $4)
    `
    await this.dataSource.query(query, [userId, parent_id, newStatus, parentType]);
  }

  async updateLike(likeId: string, newStatus: LikeStatus): Promise<void> {
    const query = `
      UPDATE likes SET status = $1, updated_at = NOW() WHERE id = $2
    `
    await this.dataSource.query(query, [newStatus, likeId]);
  }

  // async deleteLike(likeId: string): Promise<void> {
  //   const query = `
  //     DELETE FROM likes WHERE id = $1
  //   `
  //   await this.dataSource.query(query, [likeId]);
  // }
}
