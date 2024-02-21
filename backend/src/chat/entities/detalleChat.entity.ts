
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";
import { Chat } from "./chat.entity";

@Schema()
export class DetalleChat extends Document {

    @Prop()
    detalle_chat : string;

    @Prop({default : Date.now()})
    fecha : Date;

    @Prop({ type: Types.ObjectId, ref: 'Chat' })
    idConsulta : Chat;

    
}
export const DetalleChatSchema = SchemaFactory.createForClass(DetalleChat)