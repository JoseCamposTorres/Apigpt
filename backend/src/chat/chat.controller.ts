import { Controller, Get, Post, Body, Patch, Param, Delete, NotFoundException } from '@nestjs/common';
import { ChatService } from './chat.service';
import { CreateChatDto } from './dto/create-chat.dto';
import { UpdateChatDto } from './dto/update-chat.dto';
import { CreateDetalleChatDto } from './dto/create-detalleChat.dto';
import { CreateGeneralChatDto } from './dto/create-generarChat.dto';

@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post()
  create(@Body() createChatDto: CreateChatDto) {
    return this.chatService.create(createChatDto);
  }
  
  @Post('response')
  async getChatResponse(@Body() detalleChatBot: CreateDetalleChatDto): Promise<any> {
    return this.chatService.createDetalleChat(detalleChatBot)
  }

  @Post('generate-response')
  async generateChatResponse(@Body() createGeneralChatDto: CreateGeneralChatDto): Promise<any> {
    return this.chatService.generaChatGeneral(createGeneralChatDto);
  }

  @Get()
  findAll() {
    return this.chatService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.chatService.findById(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateChatDto: UpdateChatDto) {
    return this.chatService.update(+id, updateChatDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.chatService.remove(+id);
  }

}
