import { Module } from '@nestjs/common';
import {ArticlesController} from "./acticles.controller";
import {ConfigModule} from "../config/config.module";
import {ArticlesService} from "./articles.service";
import {TypeOrmModule} from "@nestjs/typeorm";
import {Article} from "./article.entity";
import {TranslationsModule} from "../translations/translations.module";
import {SectionsModule} from "../sections/sections.module";
import {BlocksModule} from "../blocks/blocks.module";
import {RiotModule} from "../riot/riot.module";

@Module({
  imports: [
    TypeOrmModule.forFeature([Article]),
    ConfigModule,
    TranslationsModule,
    BlocksModule,
    SectionsModule,
    RiotModule
  ],
  controllers: [ArticlesController],
  providers: [ArticlesService],
  exports: [ArticlesService],
})
export class ArticlesModule {}
