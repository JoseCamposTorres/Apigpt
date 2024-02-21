import { IsOptional, IsString } from "class-validator";

export class CreateChatDto {

    @IsString()
    titulo: string;

    @IsString()
    @IsOptional()
    fecha?: Date;

    @IsString()
    idUser: string;
}
