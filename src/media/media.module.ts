import { Module } from '@nestjs/common';
import { MediaController } from './media.controller';
import { ConfigModule } from "../config/config.module";

@Module({
  imports: [
    ConfigModule
  ],
  controllers: [MediaController]
})
export class MediaModule {}
