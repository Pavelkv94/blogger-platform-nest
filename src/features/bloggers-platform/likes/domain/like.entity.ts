import { Column, ManyToOne, UpdateDateColumn } from 'typeorm';
import { PrimaryGeneratedColumn } from 'typeorm';
import { Entity } from 'typeorm';
import { LikeStatus } from '../dto/like-status.dto';
import { LikeParent } from '../dto/like-parent.dto';
import { User } from '../../../user-accounts/domain/user/user.entity';

@Entity()
export class Like {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'enum', enum: LikeParent })
  parentType: string;

  @Column()
  parentId: number;

  @Column({ type: 'enum', enum: LikeStatus, default: LikeStatus.None })
  status: LikeStatus;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;

  @Column()
  userId: number;

  @ManyToOne(() => User, (user) => user.likes)
  user: User;

  static buildInstance(parentType: LikeParent, parentId: string, userId: string, status: LikeStatus): Like {
    const like = new this();
    like.parentType = parentType;
    like.parentId = +parentId;
    like.userId = +userId;
    like.status = status;
    return like;
  }

  update(newStatus: LikeStatus) {
    this.status = newStatus;
    this.updatedAt = new Date();
  }
}

// @Schema({ timestamps: true })
// export class LikeEntity {
//   @Prop({ type: String, required: true })
//   user_id: string;

//   @Prop({ type: String, required: true })
//   user_login: string;

//   @Prop({ type: String, required: true })
//   parent_id: string;

//   @Prop({ type: String, required: true, default: LikeStatus.None })
//   status: LikeStatus;

//   @Prop({ type: Date })
//   updatedAt: Date;

//   static buildInstance(user: UserDocument, parent_id: string, newStatus: LikeStatus) {
//     const like = new this();

//     like.user_id = user._id.toString();
//     like.user_login = user.login;
//     like.parent_id = parent_id;
//     like.status = newStatus;
//     like.updatedAt = new Date();

//     return like as LikeDocument;
//   }

//   update(newStatus: LikeStatus) {
//     this.status = newStatus;
//     this.updatedAt = new Date();
//   }
// }

// export const LikeSchema = SchemaFactory.createForClass(LikeEntity);

// LikeSchema.loadClass(LikeEntity);

// export type LikeDocument = HydratedDocument<LikeEntity>;

// export type LikeModelType = Model<LikeDocument> & typeof LikeEntity;
