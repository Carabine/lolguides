import { Module } from '@nestjs/common';
import {ConfigModule} from "../config/config.module";
import {HtmlController} from "./html.controller";
import {HtmlService} from "./html.service";
import {ArticlesModule} from "../articles/articles.module";
import {RiotModule} from "../riot/riot.module";

@Module({
  imports: [
    ConfigModule,
    ArticlesModule,
    RiotModule
  ],
  controllers: [HtmlController],
  providers: [HtmlService],
  exports: [HtmlService],
})
export class HtmlModule {}
