import { Controller, Get, Post, Body, Patch, Param, Delete, HttpException, HttpStatus } from '@nestjs/common';
import { BotService } from './bot.service';
import { CreateBotDto } from './dto/create-bot.dto';
import { UpdateBotDto } from './dto/update-bot.dto';

@Controller('bot')
export class BotController {
  constructor(private readonly botService: BotService) {}

  @Post()
  async createConversation(
    @Body() createBotGptDto: CreateBotDto,
  ) {
    
    console.log("hola");
    
    return this.botService.createConversation(createBotGptDto);
  }

  
  @Get('chatIdExist/:userId')
  async findByUserId(@Param('userId') userId: string) {
    return this.botService.findByUserId(userId);
  }
  
  @Post(':conversationId')
  async generationByID(
    @Param('conversationId') conversationId: string,
    @Body() updateBotChat: CreateBotDto,
  ) {
    try {
      const updatedConversation = await this.botService.generateResponseAndAddToConversation(conversationId, updateBotChat );
      return updatedConversation;
    } catch (error) {
      throw new HttpException(`Failed to update conversation: ${error.message}`, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
  
}
