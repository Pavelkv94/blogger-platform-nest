// import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
// import { LikeStatuses } from '../../dto/like-status.dto';
// import { LikesRepository } from '../../infrastructure/likes.repository';
// import { UsersRepository } from 'src/features/user-accounts/infrastructure/users.repository';
// import { LikeEntity, LikeModelType } from '../../domain/like.entity';
// import { InjectModel } from '@nestjs/mongoose';


// export class CreateLikeCommand {
//   constructor(public readonly userId: string, public readonly parent_id: string, public readonly likeStatus: LikeStatuses,) {}
// }

// @CommandHandler(CreateLikeCommand)
// export class CreateLikeUseCase implements ICommandHandler<CreateLikeCommand> {
//   constructor(
//     private readonly likesRepository: LikesRepository,
//     private readonly usersRepository: UsersRepository,
//     @InjectModel(LikeEntity.name) private LikeModel: LikeModelType,
//   ) {}

//   async execute(command: CreateLikeCommand): Promise<boolean> {
//     const user = this.usersRepository.findByIdOrNotFoundFail(command.userId);

//     const newLike = this.LikeModel.buildInstance(command.payload);

//     await this.likesRepository.save(newLike);

//     return !!newLike;
//   }
// }
