export enum LikeStatuses {
  None = 'None',
  Like = 'Like',
  Dislike = 'Dislike',
}

export class LikeStatusDto {
  myStatus: LikeStatuses;
}
