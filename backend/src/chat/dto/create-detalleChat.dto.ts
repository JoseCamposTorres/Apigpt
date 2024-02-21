import { IsOptional, IsString } from "class-validator";

export class CreateDetalleChatDto {


    @IsString()
    detalle_chat: string;

    @IsString()
    @IsOptional()
    fecha?: Date;
    @IsString()
    idConsulta: string;

    @IsString()
    idChatBot: string;

}
