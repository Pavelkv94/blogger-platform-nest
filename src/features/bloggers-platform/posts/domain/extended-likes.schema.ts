import { Prop, SchemaFactory, Schema } from '@nestjs/mongoose';
import { NewestLikesSchema } from './newest-likes-schema';
import { NewestLikes } from './newest-likes-schema';

@Schema({ _id: false })
export class ExtendedLikes {
  @Prop({ type: Number, required: true })
  likesCount: number;

  @Prop({ type: Number, required: true })
  dislikesCount: number;

  @Prop({ type: [NewestLikesSchema], required: true })
  newestLikes: NewestLikes[];
}

export const ExtendedLikesSchema = SchemaFactory.createForClass(ExtendedLikes);
