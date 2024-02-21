
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";
import { User } from "src/user/entities/user.entity";
@Schema()
export class Chat extends Document {

    @Prop()
    titulo : string;

    @Prop({default : Date.now()})
    fecha : Date;

    @Prop({ type: Types.ObjectId, ref: 'User' })
    idUser : User;
}
export const ChatSchema = SchemaFactory.createForClass(Chat)