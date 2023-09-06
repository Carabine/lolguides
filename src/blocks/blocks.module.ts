import { Module } from '@nestjs/common';
import {ConfigModule} from "../config/config.module";
import {BlocksService} from "./blocks.service";
import {TypeOrmModule} from "@nestjs/typeorm";
import {Block} from "./block.entity";

@Module({
  imports: [
    TypeOrmModule.forFeature([Block]),
    ConfigModule
  ],
  providers: [BlocksService],
  exports: [BlocksService],
})
export class BlocksModule {}
