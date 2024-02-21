import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { CreateChatDto } from './dto/create-chat.dto';
import { UpdateChatDto } from './dto/update-chat.dto';
import { Model, Types, isValidObjectId } from 'mongoose';
import { Chat } from './entities/chat.entity';
import { InjectModel } from '@nestjs/mongoose';
import { UserService } from 'src/user/user.service';
import { DetalleChat } from './entities/detalleChat.entity';
import { CreateDetalleChatDto } from './dto/create-detalleChat.dto';
import OpenAI from 'openai';
@Injectable()
export class ChatService {

  private readonly openai: OpenAI;
  constructor(

    @InjectModel(Chat.name)
    private readonly chatModule : Model<Chat>,
    @InjectModel(DetalleChat.name)
    private readonly detalleChatModule : Model<DetalleChat>,

    private readonly userService : UserService,
  ){
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
      
    })
  }
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
  async getChatResponses(ideaId: string): Promise<any[]> {
    try {
    
      const idea = await this.findById(ideaId);

      if (!idea) {
        throw new NotFoundException('Idea not found');
      }

      const message = idea.titulo;

      const responses: any[] = [];

      for (let i = 0; i < 6; i++) {
        const completion = await this.openai.chat.completions.create({
          messages: [{ role: "user", content : `Genera una sola idea sintetizadas basadas en el mensaje: "${message}"` }],
          model: "gpt-4-0125-preview",
          temperature: 0.7,
          max_tokens: 100,
        });

        responses.push({
          idea: completion.choices[0].message.content
        });
      }

      return responses;
    } catch (error) {
      console.error('Error obteniendo respuestas del chat GPT-3:', error);
      return [{ error: 'Lo siento, no pude generar respuestas en este momento.' }];
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
