import { IsString } from "class-validator";

export class CreateChatDto {


    @IsString()
    titulo: string;

    @IsString()
    fecha: string;

    @IsString()
    idUser: string;
}
