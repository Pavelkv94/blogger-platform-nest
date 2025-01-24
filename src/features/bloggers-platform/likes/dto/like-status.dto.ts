export enum LikeStatus {
  Dislike = 'Dislike',
  Like = 'Like',
  None = 'None',
}

export class LikeStatusDto {
  myStatus: LikeStatus;
}
