import { Module } from '@nestjs/common';
import { ChatService } from './chat.service';
import { ChatController } from './chat.controller';
import { Chat, ChatSchema } from './entities/chat.entity';
import { MongooseModule } from '@nestjs/mongoose';
import { UserModule } from 'src/user/user.module';

@Module({
  controllers: [ChatController],
  providers: [ChatService],

  imports : [
    MongooseModule.forFeature([
      { name: Chat.name, schema: ChatSchema }
    ]),
    UserModule
  ]
})
export class ChatModule {}
