import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { CreateChatDto } from './dto/create-chat.dto';
import { UpdateChatDto } from './dto/update-chat.dto';
import { Model, Types, isValidObjectId } from 'mongoose';
import { Chat } from './entities/chat.entity';
import { InjectModel } from '@nestjs/mongoose';
import { UserService } from 'src/user/user.service';
import { DetalleChat } from './entities/detalleChat.entity';
import { CreateDetalleChatDto } from './dto/create-detalleChat.dto';
import { BotService } from 'src/bot/bot.service';
import { CreateBotDto } from 'src/bot/dto/create-bot.dto';
import { ObjectId } from 'mongodb';

@Injectable()
export class ChatService {

  constructor(

    @InjectModel(Chat.name)
    private readonly chatModule : Model<Chat>,
    @InjectModel(DetalleChat.name)
    private readonly detalleChatModule : Model<DetalleChat>,

    private readonly userService : UserService,
    private readonly botService : BotService,
  ){}
  async create(createChatDto: CreateChatDto) {
    // Verifica si el usuario existe
    const user = await this.userService.findOne(createChatDto.idUser)
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const createdIdea = new this.chatModule({
      ...createChatDto,
      idUser: user._id, // Asigna el ID del usuario al campo createdBy
    });
    return createdIdea.save();
  }

  
  //Crear un type Chat osea  si el chat de obtener detalles y otro de generar
  async createDetalles(idChat: string) {
    try {
      // Busca el chat por su ID
      let chat = await this.findById(idChat);
      
      
  
      
      // Verifica si ya existe una conversación para el chat
      if (!await this.botService.exitUserForID(chat.idUser.toString())) {
        // Si no existe, crea los datos para la conversación y crea una nueva conversación
        const data: CreateBotDto = {
          conversation: [
            { role: "system", content: "El bot está configurado para proporcionar lista de ideas de videos a través de un texto o un hashtags que solo le de el title y siempre le da en español" },
            { role: "system", content: "You are a helpful assistant designed to output JSON." },
            { role: "user", content: "Tengo una idea para un nuevo video." },
            { role: "assistant", content: `{"ideas_de_video" : ["idea1", "idea2", "idea3", "idea4"]}` }
          ],
          idUser: chat.idUser.toString()
        };
  
        // Crea una nueva conversación
        await this.botService.createConversation(data);
      }
  
      // Busca la conversación por el ID del chat
      let idConversation = await this.botService.findByUserId(chat.idUser.toString());
  
      // Crea los datos para el mensaje del bot
      const botData: CreateBotDto = {
        idUser: chat.idUser.toString(), //Le Dat el idChat
        userMessage: "chat.titulo", // Utiliza el título del chat como mensaje del usuario
      };
  
      // Genera la respuesta del bot y añádela a la conversación
      const botResponse = await this.botService.generateResponseAndAddToConversation(idConversation, botData);
      
      
      return JSON.parse(botResponse);
    } catch (error) {
      console.error("Error al crear detalles:", error);
      throw error;
    }
    
  }
  

  
  async findAll() {
    try {
      
      const chatIdea = await this.chatModule.find();
      if(!chatIdea) throw new NotFoundException('Not found conversation');
      return chatIdea;
    } catch (error) {
      console.log(error);
      
      throw new InternalServerErrorException('Internal server error');

    }
  }

  async findById(id: string) : Promise<Chat> {
    let chat: Chat ;

    // Intenta buscar por ID si el término es un ObjectId válido
    if (isValidObjectId(id)) {
      chat = await this.chatModule.findById(id).exec();
    }
    
    // Si no se encontró ningún chat, lanzar una excepción de "No encontrado"
    if (!chat) {
      throw new NotFoundException('Chat no encontrado');
    }
    return chat;
  }



  async findByUserId(userId: string) {
    try {
      // Dentro de tu función findByUserId
      const userIdObject = new Types.ObjectId(userId);
  
      // Busca los chats asociados con el ID de usuario proporcionado y los pobla con los datos del usuario
      const chats = await this.chatModule.find({ idUser: userIdObject }).populate('idUser').exec();
  
      
      // Verifica si se encontraron chats
      if (!chats || chats.length === 0) {
        throw new NotFoundException('No se encontraron chats para el usuario');
      }
  
      // Retorna los chats y los datos completos del usuario
      return {chats};
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException('Error al buscar chats por usuario');
    }
  }
  
  
  
  
  

  update(id: number, updateChatDto: UpdateChatDto) {
    return `This action updates a #${id} chat`;
  }

  remove(id: number) {
    return `This action removes a #${id} chat`;
  }
}
