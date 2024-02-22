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
import { GeneralChat } from './entities/generalChat.entity';
import { CreateGeneralChatDto } from './dto/create-generarChat.dto';
@Injectable()
export class ChatService {

  private readonly openai: OpenAI;
  constructor(
    @InjectModel(Chat.name)
    private readonly chatModule : Model<Chat>,
    @InjectModel(DetalleChat.name)
    private readonly detalleChatModule : Model<DetalleChat>,
    @InjectModel(GeneralChat.name)
    private readonly generalChatModule : Model<GeneralChat>,

    private readonly userService : UserService,

  ){
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
      
    })
  }

  /**
   * Método para crear un nuevo chat.
   * @param createChatDto DTO con los datos para crear el chat.
   * @returns El chat creado.
  */
  async create(createChatDto: CreateChatDto) {
    // Verifica si el usuario existe
    const user = await this.userService.findOne(createChatDto.idUser)
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const createdIdea = new this.chatModule({
      ...createChatDto,
      idUser: user._id,
    });
    return createdIdea.save();
  }

  /**
   * Método para obtener respuestas de chat basadas en una idea proporcionada.
   * @param ideaId El ID de la idea para la cual se generarán respuestas de chat.
   * @returns Un arreglo de respuestas de chat generadas.
  */
  private async getChatResponses(ideaId: string): Promise<any[]> {
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
  
  /**
   * Método para crear detalles de chat a partir de las respuestas generadas.
   * @param createDetalleChatDto DTO para crear detalles de chat.
   * @returns Un arreglo de detalles de chat creados.
  */
  async createDetalleChat(createDetalleChatDto: CreateDetalleChatDto) {
    try {
      const botResponse = await this.getChatResponses(createDetalleChatDto.idConsulta);

      const detallesChat = [];

      for (let i = 0; i < botResponse.length - 1; i++) {
        const detalleChat = new this.detalleChatModule({
          idConsulta: createDetalleChatDto.idConsulta,
          detalle_chat: botResponse[i].idea
        });
        const savedDetalleChat = await detalleChat.save(); // Guardar el detalle del chat en la base de datos
        detallesChat.push(savedDetalleChat);
      }

      return detallesChat;
    } catch (error) {
      console.error("Error al crear detalles de chat:", error);
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


  /**
 * Método para generar una respuesta de chat basada en un detalle de chat específico.
 * @param detalleChatId El ID del detalle de chat para el cual se generará la respuesta.
 * @returns La respuesta de chat generada.
 */
  private formatResponse(gptResponse: string, title: string, imageURLs: string[]): any {
    // Dividir la respuesta en palabras individuales
    const words = gptResponse.split(/\s+/);

    // Filtrar palabras clave según ciertos criterios, como longitud o relevancia
    const keywords = words.filter(word => {
        // Por ejemplo, podrías considerar como palabras clave aquellas que tengan más de 5 caracteres
        return word.length > 5;
    });

    return {
        title: title,
        description: gptResponse,
        keywords: keywords,
        imageURLs: imageURLs,
    };
}
  private async generateChatResponse(createGeneralChatDto: CreateGeneralChatDto): Promise<any> {
    try {
        // Buscar el detalle de chat por su ID
        const detalleChat = await this.detalleChatModule.findById(createGeneralChatDto.idDetalleChat);

        if (!detalleChat) {
            throw new NotFoundException('Detalle de chat not found');
        }

        // Obtener el contenido del detalle de chat
        const message = detalleChat.detalle_chat;

        // Generar una respuesta de chat basada en el contenido del detalle de chat
        const completion = await this.openai.chat.completions.create({
            messages: [
                { role: "user", content: message }
            ],
            model: "gpt-4-0125-preview",
            temperature: 0.7,
            max_tokens: 100,
        });

        const gptResponse = completion.choices[0].message.content;

        // Generar imagen utilizando un modelo de GPT
        const imageCompletion = await this.openai.images.generate({ model: "dall-e-3", prompt: gptResponse });

        // Extraer la URL de la imagen de la respuesta
      const imageURLs = imageCompletion.data.map((image: any) => image.url);
      

        if (!imageURLs || imageURLs.length === 0) {
            throw new Error('No se pudo obtener la URL de la imagen generada');
        }

        // Pasar la URL de la imagen a la función formatResponse
        const formattedResponse = this.formatResponse(gptResponse, message, imageURLs);

        return formattedResponse;
    } catch (error) {
        console.error('Error generando respuesta de chat:', error);
        throw error;
    }
  }
  async generaChatGeneral(createGeneralChatDto : CreateGeneralChatDto){
    try {
      const chatResponse = await this.generateChatResponse(createGeneralChatDto);

      
      
        const detalleChat = new this.generalChatModule({

          titulo : chatResponse.title,
          descripcion : chatResponse.description,
          keywords : chatResponse.keywords,
          //guion : chatResponse.guion,
          imagen : chatResponse.imageURLs,
          id : createGeneralChatDto.idDetalleChat
          
        });
        const savedDetalleChat = await detalleChat.save(); // Guardar el detalle del chat en la base de datos
       
      
      return detalleChat;
    } catch (error) {
      console.error('Error generating chat response:', error);
      throw new NotFoundException('Error generating chat response');
    }
  }

  
  
  update(id: number, updateChatDto: UpdateChatDto) {
    return `This action updates a #${id} chat`;
  }

  remove(id: number) {
    return `This action removes a #${id} chat`;
  }
}
