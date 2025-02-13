import { User } from '../../../user-accounts/domain/user/user.entity';
import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Post } from '../../posts/domain/post.entity';
import { CreateCommentInputDto } from '../dto/create-comment.dto';
import { UserJwtPayloadDto } from '../../../user-accounts/dto/users/user-jwt-payload.dto';

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