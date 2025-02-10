import { CreateDateColumn, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Column } from 'typeorm';
import { Entity } from 'typeorm';
import { Blog } from '../../blogs/domain/blog.entity';
import { CreatePostDto } from '../dto/post-create.dto';
import { UpdateBlogPostDto, UpdatePostDto } from '../dto/post-update.dto';
import { Comment } from 'src/features/bloggers-platform/comments/domain/comment.entity';
export const titleConstraints = {
  minLength: 1,
  maxLength: 30,
};

export const shortDescriptionConstraints = {
  minLength: 1,
  maxLength: 100,
};

export const contentConstraints = {
  minLength: 1,
  maxLength: 1000,
};

@Entity()
export class Post {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ collation: 'C', length: titleConstraints.maxLength })
  title: string;

  @Column({ collation: 'C', length: shortDescriptionConstraints.maxLength })
  shortDescription: string;

  @Column({ collation: 'C', length: contentConstraints.maxLength })
  content: string;

  @CreateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ type: 'timestamptz', nullable: true })
  deletedAt: Date;

  @ManyToOne(() => Blog, (blog) => blog.posts)
  @JoinColumn({ name: 'blogId' })
  blog: Blog;

  @OneToMany(() => Comment, (comment) => comment.post)
  comments: Comment[];

  @Column({ type: 'int' })
  blogId: number;

  static buildInstance(dto: CreatePostDto): Post {
    const post = new this();
    post.title = dto.title;
    post.shortDescription = dto.shortDescription;
    post.content = dto.content;
    post.blogId = Number(dto.blogId);

    return post;
  }

  update(dto: UpdatePostDto | UpdateBlogPostDto): void {
    this.title = dto.title;
    this.shortDescription = dto.shortDescription;
    this.content = dto.content;
  }

  makeDeleted(): void {
    this.deletedAt = new Date();
  }
}

//   @Prop({
//     type: ExtendedLikesSchema,
//     required: true,
//     default: {
//       likesCount: 0,
//       dislikesCount: 0,
//       newestLikes: [],
//     },
//   })
//   extendedLikesInfo: ExtendedLikes;
