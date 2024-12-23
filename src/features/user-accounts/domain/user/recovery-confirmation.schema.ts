import { Prop, SchemaFactory, Schema } from '@nestjs/mongoose';

@Schema({ _id: false })
export class RecoveryConfirmation {
  @Prop({ type: String, nullable: true })
  recoveryCode: string;

  @Prop({ type: String, nullable: true })
  expirationDate: string;
}

export const RecoveryConfirmationSchema = SchemaFactory.createForClass(RecoveryConfirmation);
