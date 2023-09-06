import { Module } from '@nestjs/common';
import {ArticlesModule} from "./articles/articles.module";
import {ConfigModule} from "./config/config.module";
import {TypeOrmModule, TypeOrmModuleOptions} from "@nestjs/typeorm";
import {ConfigService} from "./config/config.service";
import {TranslationsModule} from "./translations/translations.module";
import {MediaModule} from "./media/media.module";
import {BlocksModule} from "./blocks/blocks.module";
import {SectionsModule} from "./sections/sections.module";
import {RiotModule} from "./riot/riot.module";
import {HtmlModule} from "./html/html.module";

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      useFactory: (config: ConfigService) => {
        return {
          type: 'sqlite',
          database: config.get("DB_NAME"),
          entities: ["dist/**/*.entity{.ts,.js}"],
          autoLoadEntities: true,
          synchronize: true,
          migrationsTableName: 'migrations',
          migrations: ['dist/migration/*.js'],
          migrationsRun: true,
          cli: {
            migrationsDir: 'migration',
          },
        } as TypeOrmModuleOptions
      },
      imports: [ConfigModule],
      inject: [ConfigService]
    }),
    ConfigModule,
    ArticlesModule,
    RiotModule,
    TranslationsModule,
    MediaModule,
    SectionsModule,
    BlocksModule,
    HtmlModule
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
