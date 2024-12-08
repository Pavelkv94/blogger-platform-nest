import { ApiProperty } from '@nestjs/swagger';
import { LikeStatusType } from '../../likes/dto/like-status.dto';
import { NewestLike, PostDocument } from '../domain/post.entity';

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
  createdAt: string;
  @ApiProperty({ example: 'Extended likes info', description: 'Extended likes info' })
  extendedLikesInfo: {
    likesCount: number;
    dislikesCount: number;
    myStatus: LikeStatusType;
    newestLikes: NewestLike[];
  };

  constructor(model: PostDocument, myStatus: LikeStatusType, newestLikes: NewestLike[]) {
    this.id = model._id.toString();
    this.title = model.title;
    this.shortDescription = model.shortDescription;
    this.content = model.content;
    this.blogId = model.blogId;
    this.blogName = model.blogName;
    this.createdAt = model.createdAt;
    this.extendedLikesInfo = {
      likesCount: model.extendedLikesInfo.likesCount,
      dislikesCount: model.extendedLikesInfo.dislikesCount,
      myStatus: myStatus, //external
      newestLikes: newestLikes,
    };
  }

  static mapToView(post: PostDocument, myStatus: LikeStatusType, newestLikes: NewestLike[]): PostViewDto {
    return new PostViewDto(post, myStatus, newestLikes);
  }
}
