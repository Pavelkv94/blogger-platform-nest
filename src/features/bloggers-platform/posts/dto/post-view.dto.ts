import { ApiProperty } from '@nestjs/swagger';
import { LikeStatus } from '../../likes/dto/like-status.dto';
import { NewestLikes } from '../domain/newest-likes-schema';
import { Post } from '../domain/post.entity';

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
    this.id = model.p_id.toString();
    this.title = model.p_title;
    this.shortDescription = model.p_shortDescription;
    this.content = model.p_content;
    this.blogId = model.p_blogId.toString();
    this.blogName = model.blogName;
    this.createdAt = model.p_createdAt;
    this.extendedLikesInfo = {
      // likesCount: +model.likes_count,
      // dislikesCount: +model.dislikes_count,
      // myStatus: model.my_status || LikeStatus.None,
      // newestLikes: model.newest_likes ? model.newest_likes.map((like) => ({ ...like, userId: like.userId.toString() })) : [],
      likesCount: 0,
      dislikesCount: 0,
      myStatus: LikeStatus.None,
      newestLikes: [],
    };
  }

  static mapToView(post: Post): PostViewDto {
    return new PostViewDto(post);
  }
}
