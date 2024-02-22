
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";
import { Chat } from "./chat.entity";
import { DetalleChat } from "./detalleChat.entity";

@Schema()
export class GeneralChat extends Document {

    @Prop({required: true})
    titulo: string;
    
    @Prop({required: true})
    descripcion: string;

    @Prop({required: true})
    keywords : string[];

    /*
    @Prop({required: true})
    guion : string;*/

    @Prop({required: true})
    imagen : string[];

    @Prop({default : Date.now()})
    fecha : Date;

    @Prop({ type: Types.ObjectId, ref: 'DetalleChat' })
    idDetalleChat : DetalleChat;

    
}
export const GeneralChatSchema = SchemaFactory.createForClass(GeneralChat)