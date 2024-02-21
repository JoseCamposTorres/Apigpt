import { Module } from '@nestjs/common';
import { ChatService } from './chat.service';
import { ChatController } from './chat.controller';
import { Chat, ChatSchema } from './entities/chat.entity';
import { MongooseModule } from '@nestjs/mongoose';
import { UserModule } from 'src/user/user.module';
import { DetalleChat, DetalleChatSchema } from './entities/detalleChat.entity';

@Module({
  controllers: [ChatController],
  providers: [ChatService],

  imports : [
    MongooseModule.forFeature([
      { name: Chat.name, schema: ChatSchema },
      { name: DetalleChat.name, schema : DetalleChatSchema}
    ]),
    UserModule,
    
  ],
  exports: [ChatService]
  
})
export class ChatModule {}
