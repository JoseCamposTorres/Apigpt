
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";
import { User } from "src/user/entities/user.entity";

export interface Message {
    role: string;
    content: string;
    
}
@Schema()
export class Bot  extends Document {
    //_id: false es para desactivar el id
    @Prop([{ role: String, content: String, _id: false}]) // Array para almacenar mensajes del usuario y del bot
    conversation: Message[];

    
    @Prop({ type: Types.ObjectId, ref: 'User' })
    idUser : User;

}
export const BotSchema = SchemaFactory.createForClass(Bot)