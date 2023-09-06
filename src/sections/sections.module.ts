import { Module } from '@nestjs/common';
import {ConfigModule} from "../config/config.module";
import {SectionsService} from "./sections.service";
import {TypeOrmModule} from "@nestjs/typeorm";
import {Section} from "./section.entity";

@Module({
  imports: [
    TypeOrmModule.forFeature([Section]),
    ConfigModule
  ],
  providers: [SectionsService],
  exports: [SectionsService],
})
export class SectionsModule {}
