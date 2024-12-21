export enum LikeStatus {
  None = 'None',
  Like = 'Like',
  Dislike = 'Dislike',
}

export class LikeStatusDto {
  myStatus: LikeStatus;
}
