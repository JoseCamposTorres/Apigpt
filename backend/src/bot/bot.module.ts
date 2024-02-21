import { Module } from '@nestjs/common';
import { BotService } from './bot.service';
import { BotController } from './bot.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Bot, BotSchema } from './entities/bot.entity';

@Module({
  controllers: [BotController],
  providers: [BotService],

  imports: [
    MongooseModule.forFeature([
      {
        name: Bot.name,
        schema: BotSchema,
      },
    ]),
  ],
  exports: [BotService],
})
export class BotModule {}
