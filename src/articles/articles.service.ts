import { Injectable } from "@nestjs/common";
import {FindManyOptions, FindOneOptions, Repository, ILike, Raw} from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";
import {Article} from "./article.entity";
import {CreateArticleDto} from "./dto/create-article.dto";
import {TranslationsService} from "../translations/translations.service";
import { v4 as uuid } from "uuid";
import {SectionsService} from "../sections/sections.service";
import {BlocksService} from "../blocks/blocks.service";
import {Block} from "../blocks/block.entity";
import {EditArticleDto} from "./dto/edit-article.dto";
import {RiotService} from "../riot/riot.service";

@Injectable()
export class ArticlesService {
  constructor(
    @InjectRepository(Article) private readonly repo: Repository<Article>,
    private readonly translationsService: TranslationsService,
    private readonly blocksService: BlocksService,
    private readonly sectionsService: SectionsService,
    private readonly riotService: RiotService
  ) {}

  async getArticles(isAdmin): Promise<Article[]> {
    const articles = await this.findAll({
      relations: ["title", "description", "metaTags", "headerTitle", "headerSubtitle", "sections", "sections.title", "sections.blocks", "sections.blocks.text"],
      order: {created: "DESC"},
      where: isAdmin ? null : {isPublished: true}
    })
    return articles
  }

  async getArticle(id): Promise<Article> {
    const article = await this.findOne({
      where: {id},
      relations: ["title", "description", "metaTags", "headerTitle", "headerSubtitle", "champion", "sections", "sections.title", "sections.blocks", "sections.blocks.text"],
      order: {created: "DESC", sections: {sortPosition: "ASC", blocks: {sortPosition: "ASC"}}}
    })
    return article
  }

  async searchArticle(text, lang): Promise<any> {
    const capitalizedText = text.toLowerCase()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')

    const articles = await this.findAll({
      where: [
        {champion: {name: {"ru": ILike(`%${text?.toLowerCase()}%`)}}},
        {champion: {name: {"ru": ILike(`%${text}%`)}}},
        {champion: {name: {"ru": ILike(`%${capitalizedText}%`)}}},

        {champion: {name: {"en": ILike(`%${text?.toLowerCase()}%`)}}},
      ],
      // where: {champion: {name: {[lang]: Raw(alias => {
      //   console.log(alias)
      //   return `LOWER(${alias}) Like '%${text2}%'`
      // })}}},
      
      relations: ["headerTitle", "headerSubtitle", "champion", "champion.name"],
      take: 4
    })

    return articles
  }

  async deleteArticle(id): Promise<void> {
    await this.deleteById(id)
  }

  async createArticle(body: CreateArticleDto): Promise<Article> {
    const title = await this.translationsService.createAndSave({...body.title, id: uuid()})
    const description = await this.translationsService.createAndSave({...body.description, id: uuid()})

    const metaTags = await this.translationsService.createAndSave({...body.metaTags, id: uuid()})

    const headerTitle = await this.translationsService.createAndSave({...body.headerTitle, id: uuid()})
    const headerSubtitle = await this.translationsService.createAndSave({...body.headerSubtitle, id: uuid()})

    const sections = []

    const article = await this.createAndSave(
      {id: uuid(), description, title, metaTags, headerTitle, headerSubtitle, slug: body.slug, imageUrl: body.imageUrl, isPublished: body.isPublished, created: new Date().getTime()}
    )

    for(const [sectionIndex, section] of body.sections.entries()) {
      const sectionTitle = await this.translationsService.createAndSave({...section.title, id: uuid()})
      const dbSection = await this.sectionsService.createAndSave({id: uuid(), title: sectionTitle, sortPosition: sectionIndex, article})

      const blocks = []
      for(const [blockIndex, block] of section.blocks.entries()) {
        const options: Block = {
          id: uuid(),
          sortPosition: blockIndex,
          type: block.type,
          section: dbSection
        }

        if(block.text) {
          const text = await this.translationsService.createAndSave({...block.text, id: uuid()})
          options.text = text
        }

        if(block.value) {
          options.value = block.value
        }

        const dbBlock = await this.blocksService.createAndSave(options)
        blocks.push(dbBlock)
      }
      sections.push({...dbSection, blocks})
    }

    return {...article, sections}
  }

  async editArticle(id: string, body: EditArticleDto): Promise<Article> {
    const title = await this.translationsService.save({id: uuid(), ...body.title})
    const description = await this.translationsService.save({id: uuid(), ...body.description})

    const metaTags = await this.translationsService.save({id: uuid(), ...body.metaTags})
    const headerTitle = await this.translationsService.save({id: uuid(), ...body.headerTitle})
    const headerSubtitle =  await this.translationsService.save({id: uuid(), ...body.headerSubtitle})

    const champion = await this.riotService.findOne({where: {id: body.championId}})

    const sections = []

    let article = await this.findOne({where: {id}})
    article = {...article, title, description, metaTags, headerTitle, headerSubtitle, slug: body.slug, imageUrl: body.imageUrl, isPublished: body.isPublished}

    if(champion) {
      article.champion = champion
    }

    await this.update(article)

    for(const [sectionIndex, section] of body.sections.entries()) {
      let dbSection = await this.sectionsService.findById(section.id ?? "")

      if(!dbSection) {
        const sectionTitle = await this.translationsService.createAndSave({...section.title, id: uuid()})
        dbSection = await this.sectionsService.createAndSave({id: uuid(), title: sectionTitle, sortPosition: sectionIndex, article})
      } else {
        await this.translationsService.update(section.title)
        dbSection = {...dbSection, sortPosition: sectionIndex}
        await this.sectionsService.update(dbSection)
      }

      const blocks = []
      for(const [blockIndex, block] of section.blocks.entries()) {
        let dbBlock = await this.blocksService.findById(block.id ?? "")

        if(!dbBlock) {
          const options: Block = {
            id: uuid(),
            sortPosition: blockIndex,
            type: block.type,
            section: dbSection
          }
          if(block.text) {
            const text = await this.translationsService.createAndSave({...block.text, id: uuid()})
            options.text = text
          }
          if(block.value) {
            options.value = block.value
          }

          dbBlock = await this.blocksService.createAndSave(options)
        } else {
          let text
          if(block.text?.id) {
            //@ts-ignore
            await this.translationsService.update(block.text)
          } else {
            text = await this.translationsService.createAndSave({...block.text, id: uuid()})
          }

          dbBlock = {...dbBlock, sortPosition: blockIndex, value: block.value === undefined ? null : block.value}
          if(block.text) {
            dbBlock.text = text
          }
          await this.blocksService.update(dbBlock)
        }
        blocks.push(dbBlock)
      }
      sections.push({...dbSection, blocks})
    }

    const updatedArticle = await this.findOne({
      where: {id},
      relations: ["title", "description", "sections", "sections.blocks", "sections.blocks.text"],
    })

    console.log(sections)
    console.log(updatedArticle.sections)

    for(const section of updatedArticle.sections) {
      if(!sections.find(s => s.id === section.id)) {
        console.log("DELETED S: " + section.id)
        await this.sectionsService.deleteById(section.id)
      } else {
       for(const block of section.blocks) {
         if(!sections.find(s => s.blocks.find(b => b.id === block.id))) {
           console.log("DELETED B: " + block.id)
           await this.blocksService.deleteById(block.id)
         }
       }
      }
    }
    return updatedArticle
  }

    async findOne(options: FindOneOptions<Article>): Promise<Article | undefined> {
    return this.repo.findOne(options);
  }

  async createAndSave(options: Article): Promise<Article> {
    return this.repo.save(this.repo.create(options));
  }

  async update(article: Article) {
    return this.repo.update(article.id, article)
  }

  async save(article: Article): Promise<Article> {
    return await this.repo.save(article);
  }

  async findAll(options: FindManyOptions<Article>): Promise<Article[]> {
    return this.repo.find(options);
  }

  async deleteById(id: string): Promise<void> {
    const result = await this.repo.delete(id)

    if(result.affected === 0) {
      throw new Error("translation deleting error")
    }
  }
}
