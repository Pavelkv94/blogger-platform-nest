// import { HydratedDocument, Model } from 'mongoose';
// import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
// import { DeletionStatus } from 'src/core/dto/deletion-status';
// import { LikesInfo } from './likes-info.schema';
// import { CommentatorInfo } from './commentator-info.schema';
// import { CommentatorInfoSchema } from './commentator-info.schema';
// import { LikesInfoSchema } from './likes-info.schema';
// import { CreateCommentDto } from '../dto/create-comment.dto';
// import { LikeStatus } from '../../likes/dto/like-status.dto';

import { User } from 'src/features/user-accounts/domain/user/user.entity';
import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Post } from '../../posts/domain/post.entity';
import { CreateCommentInputDto } from '../dto/create-comment.dto';
import { UserJwtPayloadDto } from 'src/features/user-accounts/dto/users/user-jwt-payload.dto';

export const commentContentConstraints = {
  minLength: 20,
  maxLength: 300,
};

@Entity()
export class Comment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: commentContentConstraints.maxLength, collation: 'C' })
  content: string;

  @Column()
  postId: string;

  @CreateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ type: 'timestamptz', nullable: true })
  deletedAt: Date;

  @Column()
  commentatorId: string;

  @ManyToOne(() => User, (user) => user.comments)
  @JoinColumn({ name: 'commentatorId' })
  commentator: User;

  @ManyToOne(() => Post, (post) => post.comments)
  @JoinColumn({ name: 'postId' })
  post: Post;

  static buildInstance(payload: CreateCommentInputDto, postId: string, user: UserJwtPayloadDto): Comment {
    const comment = new this();
    comment.content = payload.content;
    comment.postId = postId;
    comment.commentatorId = user.userId;
    return comment;
  }

  update(content: string) {
    this.content = content;
  }

  makeDeleted() {
    this.deletedAt = new Date();
  }
}

// @Schema({ timestamps: true })
// export class CommentEntity {
//   @Prop({ type: String, required: true, ...commentContentConstraints })
//   content: string;

//   @Prop({ type: String, required: true })
//   postId: string;

//   @Prop({ type: Date })
//   createdAt: Date;

//   @Prop({ type: String, required: true, default: DeletionStatus.NotDeleted })
//   deletionStatus: DeletionStatus;

//   @Prop({ type: CommentatorInfoSchema, required: true })
//   commentatorInfo: CommentatorInfo;

//   @Prop({ type: LikesInfoSchema, required: true, default: { likesCount: 0, dislikesCount: 0 } })
//   likesInfo: LikesInfo;

//   static buildInstance(dto: CreateCommentDto): CommentDocument {
//     const comment = new this(); //CommentModel!

//     comment.postId = dto.postId;
//     comment.content = dto.content;
//     comment.commentatorInfo = {
//       userId: dto.user._id.toString(),
//       userLogin: dto.user.login,
//     };

//     return comment as CommentDocument;
//   }

//   makeDeleted() {
//     this.deletionStatus = DeletionStatus.PermanentDeleted;
//   }

//   update(content: string) {
//     this.content = content;
//   }

//   countLikes(prevStatus: LikeStatus, newStatus: LikeStatus) {
//     // if (prevStatus === 'Like') this.likesInfo.likesCount -= 1;
//     // if (prevStatus === 'Dislike') this.likesInfo.dislikesCount -= 1;
//     // if (newStatus === 'Like') this.likesInfo.likesCount += 1;
//     // if (newStatus === 'Dislike') this.likesInfo.dislikesCount += 1;
//   }
// }

// export const CommentSchema = SchemaFactory.createForClass(CommentEntity);

// CommentSchema.loadClass(CommentEntity);

// export type CommentDocument = HydratedDocument<CommentEntity>;

// export type CommentModelType = Model<CommentDocument> & typeof CommentEntity;
