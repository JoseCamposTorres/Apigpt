import { Type } from "class-transformer";
import { IsArray, IsNotEmpty, IsOptional, IsString, ValidateNested } from "class-validator";

class MessageDto {
    @IsNotEmpty()
    role: string;
  
    @IsNotEmpty()
    @ValidateNested()
    @Type(() => Object)
    content: string | object;
  
    
}
export class CreateBotDto {

    @IsNotEmpty({ message: 'El mensaje del usuario es requerido' })
    @IsOptional()
    @IsString({ message: 'El mensaje del usuario debe ser una cadena de texto' })
    readonly userMessage?: string;
    
    @IsArray()
    @IsOptional()
    @Type(() => MessageDto)
    conversation ?: MessageDto[];

    @IsString()
    @IsOptional()
    idUser  : string;
}
