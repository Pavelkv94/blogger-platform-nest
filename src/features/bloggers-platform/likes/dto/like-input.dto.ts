import { IsString } from 'class-validator';
import { LikeStatus } from './like-status.dto';
import { ApiProperty } from '@nestjs/swagger';
import { IsLikeStatus } from 'src/core/decorators/validation/isLikeStatus';

export class LikeInputDto {
  @ApiProperty({ example: 'Like', description: 'Like status' })
  @IsString()
  @IsLikeStatus()
  likeStatus: LikeStatus;
}
