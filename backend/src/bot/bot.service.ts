import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { CreateBotDto } from './dto/create-bot.dto';
//import { UpdateBotDto } from './dto/update-bot.dto';
import { Model, Types } from 'mongoose';
import { Bot } from './entities/bot.entity';
import { InjectModel } from '@nestjs/mongoose';
//import { ChatService } from 'src/chat/chat.service';
import OpenAI from 'openai';
import { ObjectId } from 'mongodb';

@Injectable()
export class BotService {
  private readonly openai: OpenAI;

  constructor(

    @InjectModel(Bot.name)
    private readonly botModel: Model<Bot>,

    //private readonly chatService : ChatService,
  ){
    this.openai = new OpenAI({
      apiKey: "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",
      
    })
  }
  private async saveConversation(createBotGptDto: CreateBotDto) {
    try {
      const bot = await this.botModel.create( createBotGptDto)
      return bot;
    } catch (error) {
      if(error.code === 11000){
        throw new BadRequestException(`Bot exists in BD ${JSON.stringify(error.keyValue)}`)
      }
      console.log(error);
      throw new InternalServerErrorException(`Can't Create Bot -check server logs`)  

    }
  }
  async createConversation(createBotGptDto: CreateBotDto): Promise<string> {
    try {
      // Crear la conversación inicial en la base de datos
      const initialConversation = await this.saveConversation(createBotGptDto);
      const conversationId = initialConversation._id;

      // Devolver el ID de la conversación
      return conversationId;
    } catch (error) {
      throw new Error(`Failed to create conversation: ${error.message}`);
    }
  }

  async exitUserForID(userId: string): Promise<boolean> {
    try {
      // Busca los chats asociados con el ID de usuario proporcionado y los pobla con los datos del usuario
      const users = await this.botModel.find({ idUser: userId }).populate('idUser').exec();
  
      // Verifica si se encontraron chats
      const usersFound = users && users.length > 0;
  
      return usersFound;
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException('Error al buscar chats por usuario');
    }
  }

  async findByUserId(userId: string) {
    try {
      // Busca los chats asociados con el ID de usuario proporcionado y los pobla con los datos del usuario
      const users = await this.botModel.find({ idUser: userId }).populate('idUser').exec();
  
      
      // Verifica si se encontraron chats
      if (!users || users.length === 0) {
        throw new NotFoundException('No se encontraron chats para el usuario');
      }
  
      // Retorna los chats y los datos completos del usuario
      return users[0]._id.toString();
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException('Error al buscar chats por usuario');
    }
  }
  
  
  private async getConversationMessages(conversationId: string): Promise<any> {
    try {
      const conversation = await this.botModel.findById(conversationId);
      return conversation.conversation; // Suponiendo que 'messages' es el campo donde están almacenados los mensajes en tu entidad BotGpt
    } catch (error) {
      throw new Error(`Failed to fetch conversation messages: ${error.message}`);
    }
  }
  async generateResponseAndAddToConversation(conversationId: string, createBotGptDto: CreateBotDto): Promise<string> {
    try {
        
      //const userIdObject = new Types.ObjectId(conversationId);
  
        let existingConversation = await this.botModel.findById(conversationId); 
        // Objeto que deseas agregar
        const newMessage = { role: 'user', content: createBotGptDto.userMessage };

        // Agregar el nuevo mensaje a la conversación
        existingConversation.conversation.push(newMessage);
        
        

        // Guardar la conversación actualizada en la base de datos
        existingConversation = await existingConversation.save();

        console.log(existingConversation.conversation);
        // Generar la respuesta utilizando OpenAI
        const response = await this.openai.chat.completions.create({
            model: "gpt-4-0125-preview",
            messages: await this.getConversationMessages(conversationId), // Utiliza la conversación actualizada que incluye todos los mensajes anteriores y el nuevo mensaje
            response_format: { type: "json_object" },
            temperature: 0.7,
            max_tokens: 1000,
            
            top_p: 1,
        });
        // Extraer la respuesta generada por OpenAI
        let botResponse = response.choices[0].message.content;
         botResponse = JSON.stringify(botResponse);


        // Agregar el mensaje del bot a la conversación
        existingConversation.conversation.push({ role: 'assistant', content: botResponse });

        // Guardar la conversación actualizada en la base de datos
        existingConversation = await existingConversation.save();
        
        // Devolver la respuesta generada
        return botResponse;
    } catch (error) {
        throw new Error(`Failed to generate response: ${error.message}`);
    }
}
}
