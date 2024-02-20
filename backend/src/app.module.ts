import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserModule } from './user/user.module';
import { ChatModule } from './chat/chat.module';


@Module({
  imports: [
    UserModule,
    MongooseModule.forRoot('mongodb://localhost:27017/smosGpt'),
    ChatModule,
    ],
 
})
export class AppModule {}
