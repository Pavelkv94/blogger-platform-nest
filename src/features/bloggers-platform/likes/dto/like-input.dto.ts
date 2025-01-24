import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { IsLikeStatus } from 'src/core/decorators/validation/isLikeStatus';
import { LikeStatus } from './like-status.dto';

export class LikeInputDto {
  @ApiProperty({ example: 'Like', description: 'Like status' })
  @IsString()
  @IsLikeStatus()
  likeStatus: LikeStatus;
}
