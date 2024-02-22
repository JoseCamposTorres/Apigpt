import { IsOptional, IsString } from "class-validator";

export class CreateGeneralChatDto {

    @IsString()
    idDetalleChat: string;

    
}
