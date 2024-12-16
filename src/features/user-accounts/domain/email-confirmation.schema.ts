import { Prop, SchemaFactory, Schema } from '@nestjs/mongoose';

@Schema({ _id: false })
export class EmailConfirmation {
  @Prop({ type: String, required: true })
  confirmationCode: string;

  @Prop({ type: String, required: true })
  expirationDate: string;

  @Prop({ type: Boolean, required: true })
  isConfirmed: boolean;
}

export const EmailConfirmationSchema = SchemaFactory.createForClass(EmailConfirmation);
