import { ApiProperty } from '@nestjs/swagger';
import { LikeStatus } from '../../likes/dto/like-status.dto';
import { PostDocument } from '../domain/post.entity';
import { NewestLikes } from '../domain/newest-likes-schema';

export class PostViewDto {
  @ApiProperty({ example: 'Post ID', description: 'ID of the post' })
  id: string;
  @ApiProperty({ example: 'Post title', description: 'Title of the post' })
  title: string;
  @ApiProperty({ example: 'Short description', description: 'Short description of the post' })
  shortDescription: string;
  @ApiProperty({ example: 'Content', description: 'Content of the post' })
  content: string;
  @ApiProperty({ example: 'Blog ID', description: 'ID of the blog' })
  blogId: string;
  @ApiProperty({ example: 'Blog name', description: 'Name of the blog' })
  blogName: string;
  @ApiProperty({ example: 'Created at', description: 'Created at date' })
  createdAt: Date;
  @ApiProperty({ example: 'Extended likes info', description: 'Extended likes info' })
  extendedLikesInfo: {
    likesCount: number;
    dislikesCount: number;
    myStatus: LikeStatus;
    newestLikes: NewestLikes[];
  };

  constructor(model: any) {
    this.id = model.id.toString();
    this.title = model.title;
    this.shortDescription = model.short_description;
    this.content = model.content;
    this.blogId = model.blog_id.toString();
    this.blogName = model.blogName;
    this.createdAt = model.createdAt;
    this.extendedLikesInfo = {
      likesCount: +model.likes_count,
      dislikesCount: +model.dislikes_count,
      myStatus: model.my_status || LikeStatus.None,
      newestLikes: model.newest_likes ? model.newest_likes.map((like) => ({ ...like, userId: like.userId.toString() })) : [],
    };
  }

  static mapToView(post: PostDocument): PostViewDto {
    return new PostViewDto(post);
  }
}
