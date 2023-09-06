import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { FindManyOptions, FindOneOptions, Repository } from "typeorm";
import {RiotEntity} from "./riot-entity.entity";
import {catchError, firstValueFrom} from "rxjs";
import {AxiosError} from "axios";
import {RiotEntityType} from "./riot-entity-type.enum";
import {TranslationsService} from "../translations/translations.service";
import {ConfigService} from "../config/config.service";
import {HttpService} from "@nestjs/axios";
import {v4 as uuid} from "uuid";
import shardsData from './data/shards'

@Injectable()
export class RiotService {
  constructor(
    @InjectRepository(RiotEntity) private readonly repo: Repository<RiotEntity>,
    private readonly config: ConfigService,
    private readonly axios: HttpService,
    private readonly translationsService: TranslationsService,
  ) { }

  create(options: RiotEntity): RiotEntity {
    return this.repo.create(options);
  }

  async save(riotEntity: RiotEntity): Promise<void> {
    await this.repo.save(riotEntity);
  }

  async find(options: FindManyOptions<RiotEntity>): Promise<RiotEntity[] | undefined> {
    return this.repo.find(options);
  }

  async findOne(options: FindOneOptions<RiotEntity>): Promise<RiotEntity | undefined> {
    return this.repo.findOne(options);
  }

  async createAndSave(options: RiotEntity): Promise<RiotEntity> {
    //    return this.repo.save(options);
    return this.repo.save(this.repo.create(options));
  }

  async deleteById(id: string): Promise<void> {
    const result = await this.repo.delete(id)

    if(result.affected === 0) {
      throw new Error("riot entity deleting error")
    }
  }

  async updateChampions(): Promise<{champsData: RiotEntity[], skillsData: RiotEntity[]}> {
    const { data: {data: enResponse} } = await firstValueFrom(
      this.axios.get(`${this.config.get("RIOT_CDN_V")}/data/en_US/champion.json`).pipe(
        catchError((error: AxiosError) => {
          throw new Error("err");
        }),
      ),
    );
    const { data: {data: ruResponse} } = await firstValueFrom(
      this.axios.get(`${this.config.get("RIOT_CDN_V")}/data/ru_RU/champion.json`).pipe(
        catchError((error: AxiosError) => {
          console.log(error)
          throw new Error("err");
        }),
      ),
    );

    const enData: {[key: string]: any} = Object.entries(enResponse).map(item => item[1])
    const ruData: {[key: string]: any} = Object.entries(ruResponse).map(item => item[1])

    const data = enData.map((item, index) => (
      {
        id: item.id,
        name: {en: item.name, ru: ruData[index].name},
        image: `${this.config.get("RIOT_CDN_V")}/img/champion/${item.image.full}`
      }
    ))

    console.log("d",data)

    const champsData = []

    const skillsData = [].concat(
      ...await Promise.all(enData.map(async item => {
      const { data: {data: ruChampResponse} } = await firstValueFrom(
        this.axios.get(`${this.config.get("RIOT_CDN_V")}/data/ru_RU/champion/${item.id}.json`).pipe(
          catchError((error: AxiosError) => {
            console.log(error)
            throw new Error("err");
          }),
        ),
      );
      const { data: {data: enChampResponse} } = await firstValueFrom(
        this.axios.get(`${this.config.get("RIOT_CDN_V")}/data/en_US/champion/${item.id}.json`).pipe(
          catchError((error: AxiosError) => {
            console.log(error)
            throw new Error("err");
          }),
        ),
      );

      const enChampData: {[key: string]: any} = Object.entries(enChampResponse).map(item => item[1])[0]
      const ruChampData: {[key: string]: any} = Object.entries(ruChampResponse).map(item => item[1])[0]

      const champName = await this.translationsService.createAndSave({
        id: uuid(),
        en: enChampData.name,
        ru: ruChampData.name
      })

      champsData.push(
        await this.createAndSave({
          id: enChampData.id,
          name: champName,
          image: `${this.config.get("RIOT_CDN_V")}/img/champion/${item.image.full}`,
          type: RiotEntityType.Champion
        })
      )

      const spellsData = []

      spellsData.push({
        id: `${enChampData.id}P`,
        name: {en: enChampData.passive.name, ru: ruChampData.passive.name},
        description: {en: enChampData.passive.description, ru: ruChampData.passive.description},
        image: `${this.config.get("RIOT_CDN_V")}/img/passive/${enChampData.passive.image.full}`
      })

      for(const [spellIndex, spell] of enChampData.spells.entries()) {
        spellsData.push({
          id: spell.id,
          name: {en: spell.name, ru: ruChampData.spells[spellIndex].name},
          description: {en: spell.description, ru: ruChampData.spells[spellIndex].description},
          cooldown: spell.cooldown.join("/"),
          image: `${this.config.get("RIOT_CDN_V")}/img/spell/${spell.image.full}`
        })
      }

      for(const spell of spellsData) {
        const name = await this.translationsService.createAndSave({
          id: uuid(),
          en: spell.name.en,
          ru: spell.name.ru
        })
        const description = await this.translationsService.createAndSave({
          id: uuid(),
          en: spell.description.en,
          ru: spell.description.ru
        })
        await this.createAndSave({
          id: spell.id,
          name,
          description,
          cooldown: spell.cooldown,
          image: spell.image,
          type: RiotEntityType.Skill
        })
      }

      return spellsData
      //return enChampData
    })))

    const { data: {data: ruSummonerSpellsResponse} } = await firstValueFrom(
      this.axios.get(`${this.config.get("RIOT_CDN_V")}/data/ru_RU/summoner.json`).pipe(
        catchError((error: AxiosError) => {
          console.log(error)
          throw new Error("err");
        }),
      ),
    );

    const { data: {data: enSummonerSpellsResponse} } = await firstValueFrom(
      this.axios.get(`${this.config.get("RIOT_CDN_V")}/data/en_US/summoner.json`).pipe(
        catchError((error: AxiosError) => {
          console.log(error)
          throw new Error("err");
        }),
      ),
    );

    const enSummonerSpellsData: {[key: string]: any} = Object.entries(enSummonerSpellsResponse).map(item => item[1])

    const ruSummonerSpellsData: {[key: string]: any} = Object.entries(ruSummonerSpellsResponse).map(item => item[1])

    console.log(enSummonerSpellsData)

    for(const [spellIndex, summonerSpell] of enSummonerSpellsData.entries()) {
      const name = await this.translationsService.createAndSave({
        id: uuid(),
        en: summonerSpell.name,
        ru: ruSummonerSpellsData[spellIndex].name
      })
      const description = await this.translationsService.createAndSave({
        id: uuid(),
        en: summonerSpell.description,
        ru: ruSummonerSpellsData[spellIndex].description
      })
      skillsData.push(await this.createAndSave({
        id: summonerSpell.id,
        name,
        description,
        cooldown: summonerSpell.cooldown,
        image: `${this.config.get("RIOT_CDN_V")}/img/spell/${summonerSpell.image.full}`,
        type: RiotEntityType.Skill
      }))
      console.log(spellIndex)
    }

    return {champsData, skillsData}
  }

  async updateItems() {
    const { data: {data: enResponse} } = await firstValueFrom(
      this.axios.get(`${this.config.get("RIOT_CDN_V")}/data/en_US/item.json`).pipe(
        catchError((error: AxiosError) => {
          throw new Error("err");
        }),
      ),
    );
    const { data: {data: ruResponse} } = await firstValueFrom(
      this.axios.get(`${this.config.get("RIOT_CDN_V")}/data/ru_RU/item.json`).pipe(
        catchError((error: AxiosError) => {
          console.log(error)
          throw new Error("err");
        }),
      ),
    );


    // @ts-ignore
    const enData: {[key: string]: any}[] = Object.entries(enResponse).map(item => ({id: item[0], ...item[1]}))
    // @ts-ignore
    const ruData: {[key: string]: any}[] = Object.entries(ruResponse).map(item => ({id: item[0], ...item[1]}))

    console.log(enData)
    const itemsData = []
    for(const [index, itemData] of enData.entries()) {
      const name = await this.translationsService.createAndSave({
        id: uuid(),
        en: itemData.name,
        ru: ruData[index].name
      })
      const description = await this.translationsService.createAndSave({
        id: uuid(),
        en: itemData.description,
        ru: ruData[index].description
      })

      const item = await this.createAndSave({
        id: itemData.id,
        name,
        description,
        image: `${this.config.get("RIOT_CDN_V")}/img/item/${itemData.image.full}`,
        type: RiotEntityType.Item
      })
      itemsData.push(item)

    }
    console.log(itemsData)
    return itemsData;
  }

  async updateRunes() {
    const { data: enData } = await firstValueFrom(
      this.axios.get(`${this.config.get("RIOT_CDN_V")}/data/en_US/runesReforged.json`).pipe(
        catchError((error: AxiosError) => {
          throw new Error("err");
        }),
      ),
    );
    const {data: ruData} = await firstValueFrom(
      this.axios.get(`${this.config.get("RIOT_CDN_V")}/data/ru_RU/runesReforged.json`).pipe(
        catchError((error: AxiosError) => {
          console.log(error)
          throw new Error("err");
        }),
      ),
    );


    const data = []
    for(const [index, runeData] of enData.entries()) {
      const name = await this.translationsService.createAndSave({
        id: uuid(),
        en: runeData.name,
        ru: ruData[index].name
      })

      const rune = await this.createAndSave({
        id: runeData.id.toString(),
        name,
        image: `${this.config.get("RIOT_CDN_CANISBACK")}/img/${runeData.icon}`,
        type: RiotEntityType.Rune
      })
      data.push(rune)

      for(const [slotIndex, slot] of runeData.slots.entries()) {
        for(const [slotRuneIndex, slotRuneData] of slot.runes.entries()) {
          const name = await this.translationsService.createAndSave({
            id: uuid(),
            en: slotRuneData.name,
            ru: ruData[index].slots[slotIndex].runes[slotRuneIndex].name
          })
          const description = await this.translationsService.createAndSave({
            id: uuid(),
            en: slotRuneData.shortDesc,
            ru: ruData[index].slots[slotIndex].runes[slotRuneIndex].shortDesc
          })

          const slotRune = await this.createAndSave({
            id: slotRuneData.id.toString(),
            name,
            description,
            image: `${this.config.get("RIOT_CDN_CANISBACK")}/img/${slotRuneData.icon}`,
            type: RiotEntityType.Rune
          })
          data.push(slotRune)
        }
      }

      for(const dataItem of shardsData) {
        const name = await this.translationsService.createAndSave({
          ...dataItem.name,
          id: uuid(),
        })
        const description = await this.translationsService.createAndSave({
          ...dataItem.description,
          id: uuid(),
        })
        const shard = await this.createAndSave({
          id: dataItem.id.toString(),
          name,
          description,
          image: dataItem.image,
          type: RiotEntityType.Rune
        })
        data.push(shard)
      }
    }
    console.log(data)
    return data;
  }

}
