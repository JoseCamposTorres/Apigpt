import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateChatDto } from './dto/create-chat.dto';
import { UpdateChatDto } from './dto/update-chat.dto';
import { Model } from 'mongoose';
import { Chat } from './entities/chat.entity';
import { InjectModel } from '@nestjs/mongoose';
import { UserService } from 'src/user/user.service';

@Injectable()
export class ChatService {

  constructor(

    @InjectModel(Chat.name)
    private readonly chatModule : Model<Chat>,

    private readonly userService : UserService,
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

  findAll() {
    return `This action returns all chat`;
  }

  findOne(id: number) {
    return `This action returns a #${id} chat`;
  }

  update(id: number, updateChatDto: UpdateChatDto) {
    return `This action updates a #${id} chat`;
  }

  remove(id: number) {
    return `This action removes a #${id} chat`;
  }
}
