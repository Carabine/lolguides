import {Module} from '@nestjs/common';
import {HttpModule} from "@nestjs/axios"
import {RiotController} from "./riot.controller";
import {ConfigModule} from "../config/config.module";
import {TranslationsModule} from "../translations/translations.module";
import {RiotService} from "./riot.service";
import {RiotEntity} from "./riot-entity.entity";
import {TypeOrmModule} from "@nestjs/typeorm";

@Module({
  controllers: [RiotController],
  imports: [
    TypeOrmModule.forFeature([RiotEntity]),
    ConfigModule,
    HttpModule,
    TranslationsModule,
  ],
  providers: [RiotService],
  exports: [RiotService]
})
export class RiotModule {}
