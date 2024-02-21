import { IsOptional, IsString } from "class-validator";

export class CreateDetalleChatDto {

    @IsString()
    idConsulta: string;

    
}
