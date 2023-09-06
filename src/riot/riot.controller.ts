import {Controller, Get, UseGuards} from '@nestjs/common';
import {ConfigService} from "../config/config.service";
import {AxiosError} from "axios"
import {HttpService} from "@nestjs/axios";
import {catchError, firstValueFrom} from 'rxjs';
import {TranslationsService} from "../translations/translations.service";
import {RiotService} from "./riot.service";
import {AdminGuard} from "../auth/guards/admin.guard";

@Controller("/api/riot-api")
export class RiotController {
  constructor(
    private readonly config: ConfigService,
    private readonly axios: HttpService,
    private readonly translationsService: TranslationsService,
    private readonly riotService: RiotService,
  ) {}

  @Get("/update-champions")
  @UseGuards(AdminGuard)
  async updateChampions(): Promise<any> {
    console.log(111)

    const skillsData = await this.riotService.updateChampions()
    console.log(222)
    var time = Date.now();
    this.translationsService.deleteUnusedTranslations()
    time = Date.now() - time;
    console.log('Время выполнения = ', time)

    console.log(333)

    return skillsData;
  }

  @Get("/update-items")
  @UseGuards(AdminGuard)
  async updateItems(): Promise<any> {
    const itemsData = await this.riotService.updateItems()

    await this.translationsService.deleteUnusedTranslations()

    return itemsData
  }

  @Get("/update-runes")
  @UseGuards(AdminGuard)
  async updateRunes(): Promise<any> {
    const runesData = await this.riotService.updateRunes()

    await this.translationsService.deleteUnusedTranslations()

    return runesData
  }
}
