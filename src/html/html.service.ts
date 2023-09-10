import {Injectable} from "@nestjs/common";
import {ArticlesService} from "../articles/articles.service";
import {ConfigService} from "../config/config.service";
import {BlockType} from "../blocks/block-type.enum";
import {RiotService} from "../riot/riot.service";
import shardsData from './../riot/data/shards'
import {i18n} from "./data/i18n.data";
import { RiotEntityType } from "src/riot/riot-entity-type.enum";

@Injectable()
export class HtmlService {
  constructor(
    private readonly articlesService: ArticlesService,
    private readonly config: ConfigService,
    private readonly riotService: RiotService
  ) {}

  async renderArticlesPage(lang) {
    const articles = await this.articlesService.findAll({
      relations: ["title", "headerTitle", "headerSubtitle", "champion", "champion.name"],
      take: 9
    })
    return { 
      url: this.config.get("URL"), 
      title: {en: "Guide list :: LoLGuides", ru: "Список гайдов :: LoLGuides"}, 
      metaTitle: {en: "League of Legends guides: build, runes, items, strategy", ru: "Гайды по League of Legends: сборка, руны, предметы, стратегия"},
      // description: {en: articles.map(a => a.champion.name["en"]).join(" · "), ru: articles.map(a => a.champion.name["ru"]).join(" · ")}, 
      description: {
        en: "Unlock Victory with League of Legends Guides! Discover Strategies, Champion Tips, and Winning Tactics on LoLGuides. Dominate and Climb the Ranks with our Comprehensive Resources",
        ru: "Достигните победы с гайдами по Лиге Легенд! Откройте для себя стратегии, советы по чемпионам и выигрышные тактики на LoLGuides. Доминируйте и поднимайтесь в рейтинге с нашими всесторонними ресурсами"
      },
      i18n, articles, lang
    };
  }

  async renderArticlePage(lang, slug) {
    const article = await this.articlesService.findOne({
      where: {slug},
      relations: ["title", "description", "metaTags", "headerTitle", "headerSubtitle", "sections", "sections.title", "sections.blocks", "sections.blocks.text"],
      order: {created: "DESC", sections: {sortPosition: "ASC", blocks: {sortPosition: "ASC"}}}
    })

    const sections = []


    for(const section of article?.sections) {
      const blocks = []
      for(const block of section.blocks) {
        console.log(block.type)
        if(block.type === BlockType.Items) {
          if(block.value) {
            const itemIds = block.value.replace(/\s/g, "").split(",")
            const items = await this.riotService.find({where: itemIds.map(itemId => ({id: itemId})), relations: ["name", "description"]})
            const sortedItems = itemIds.map(itemId => items.find((item) => item.id === itemId)).filter(item => item)
  
            blocks.push(this.getItemsBlock(block.text, sortedItems, lang))
          }
          
        } else if(block.type === BlockType.Abilities) {
          const parsedValue = block.value.replace(/\s/g, "").split(";")
          const skillsOrderData = parsedValue.map(value => ({id: value.split(":")[0], order: value.split(":")[1].split("/").map(orderItem => Number(orderItem)), data: {}}))

          const skillsData = await this.riotService.find({where: skillsOrderData.map(skillData => ({id: skillData.id})), relations: ["name", "description"]})

          for(const [index, skillOrderData] of skillsOrderData.entries()) {
            skillsOrderData[index].data = skillsData.find((dataItem) => dataItem.id === skillOrderData.id)
          }

          blocks.push(this.getAbilityOrderBlock(skillsOrderData, lang))

        } else if(block.type === BlockType.Runes) {
          let parsedValue: any = block.value.replace(/\s/g, "").split(";")
          parsedValue = {
            mainTree: {
              id: parsedValue[0].split(":")[0],
              //runes: parsedValue[0].split(":")[1].split(",").map(runeId => (runeId.includes("!") ? {id: runeId.replace("!", ""), active: true} : {id: runeId, active: false}))
              runes: parsedValue[0].split(":")[1].split("/").map(runeRow => runeRow.split(",").map(runeId => (runeId.includes("!") ? {id: runeId.replace("!", ""), active: true} : {id: runeId, active: false})))
            },
            secondaryTree: {
              id: parsedValue[1].split(":")[0],
              //runes: parsedValue[1].split(":")[1].split(",").map(runeId => (runeId.includes("!") ? {id: runeId.replace("!", ""), active: true} : {id: runeId, active: false}))
              runes: parsedValue[1].split(":")[1].split("/").map(runeRow => runeRow.split(",").map(runeId => (runeId.includes("!") ? {id: runeId.replace("!", ""), active: true} : {id: runeId, active: false})))
            },
          }

          const data = await this.riotService.find({
            where: [
              ...parsedValue.mainTree.runes.map(runeRow => [].concat(...runeRow.map(rune => ({id: rune.id})))),
              ...parsedValue.secondaryTree.runes.map(runeRow => [].concat(...runeRow.map(rune => ({id: rune.id})))),
              {id: parsedValue.mainTree.id},
              {id: parsedValue.secondaryTree.id}
            ],
            relations: ["name", "description"]
          })

          const runesData = {
            mainTree: {
              ...parsedValue.mainTree,
              data: data.find(dataItem => dataItem.id === parsedValue.mainTree.id) ?? {},
              runes: parsedValue.mainTree.runes.map(runeRow => runeRow.map(rune => ({...rune, data: data.find(dataItem => dataItem.id === rune.id) ?? {}}))),
            },
            secondaryTree: {
              ...parsedValue.secondaryTree,
              data: data.find(dataItem => dataItem.id === parsedValue.secondaryTree.id) ?? {},
              runes: parsedValue.secondaryTree.runes.map(runeRow => runeRow.map(rune => ({...rune, data: data.find(dataItem => dataItem.id === rune.id) ?? {}}))),
            }
          }

          blocks.push(this.getRunesBlock(runesData, lang))
        } else if(block.type === BlockType.Title) {
          blocks.push(this.getTitleBlock(block.text, lang))
        } else if(block.type === BlockType.ItemTitle) {
          const item = await this.riotService.findOne({
            where: {id: block.value},
            relations: ["name", "description"]
          })

          
          if(item) {
            blocks.push(this.getItemTitleBlock(item, lang, item.type !== RiotEntityType.Champion))
          }         
        } else if(block.type === BlockType.Text) {
          const matchesEn = block.text.en.match(/\[.*?\]/g)?.map(x => x.replace(/[\[\]]/g, "")) ?? []
          const matchesRu = block.text.ru.match(/\[.*?\]/g)?.map(x => x.replace(/[\[\]]/g, "")) ?? []

        
          const names = []

          const matches = [...matchesEn, ...matchesRu]
            .map(m => {
              const str = m
              const nameMatch = str.match(/\(.*?\)/g)?.[0]?.replace(/[\(\)]/g, "")
              if(nameMatch) names.push(nameMatch)
              return m.replace(/\(.*?\)/g, "")
            })
            .filter((value, index, self) => {
              return self.indexOf(value) === index;
            })      

          const data = matches.length ?
            await this.riotService.find({
              where: [
                ...matches.map(matchItem => ({id: matchItem})),
              ],
              relations: ["name", "description"]
            }) :
            []

            console.log(data)

          if(block) {
            blocks.push(this.getTextBlock(block.text, lang, data))
          }
          
        } else if(block.type === BlockType.ProsCons) {
          const pros = {ru: block.text.ru.split(";")[0].split("/"), en: block.text.en.split(";")[0].split("/")}
          const cons = {ru: block.text.ru.split(";")[1].split("/"), en: block.text.en.split(";")[1].split("/")}

          blocks.push(this.getProsConsBlock(pros, cons, lang))
        }

      }
      sections.push({...section, blocks})
    }

    console.log(article)

    return { url: this.config.get("URL"), article: {...article, imageUrl: article.imageUrl.replace(/\\/g, "/"), sections}, i18n, lang};
  }

  getItemsBlock(text, items, lang): string {
    return `
      <div class="section-block items-block">
        ${text?.[lang] ? `
          <div class="items-title">
            <h3>${text[lang]}</h3>
          </div>
        `: ""}
        <div class="items-container"> 
          ${items.map(item => `
          <div class="item" data-tooltip-id="item${item.id}">
            <img src="${item.image}" />
              <span class="item-description">
                  ${item.name[lang]}
              </span>
            </div>
            ${this.getTooltip(item, `item${item.id}`, lang)}
          `).join("")}
        </div>
      </div>
    `
  }

  getAbilityOrderBlock(skillsData, lang): string {
    return `
      <div class="section-block skill-order-block">
        ${skillsData.map(dataItem => `
          <div class="skill-order-item">
            <div class="skill-img" data-tooltip-id="skill-order-item${dataItem.id}">
                <img src="${dataItem.data.image}" />
            </div>
            <div class="skill-row">
              <div class="skill-title">
                  <div class="skill-title-img" data-tooltip-id="skill-order-item${dataItem.id}">
                      <img src="${dataItem.data.image}" />
                  </div>
                  <span>${dataItem.data.name[lang]}</span>
              </div>
              <div class="skill-path">
                ${new Array(18).fill(undefined).map((_, index) => 
                  dataItem.order.includes(index + 1) ? 
                    `<div class="path-element active">${index + 1}</div>` : 
                    `<div class="path-element"></div>`
                ).join("")}
              </div>
            </div>
          </div>
          ${this.getTooltip({dataItem, ...dataItem.data}, `skill-order-item${dataItem.id}`, lang)}
        `).join("")}
      </div>
    `
  }

  getRunesBlock({mainTree, secondaryTree}, lang): string {
    return `
      <div class="section-block runes-block">
        <div class="runes-tree primary-tree">
          <div class="rune-header">
            <img src="${mainTree.data.image}" />
            <span>${mainTree.data.name[lang]}</span>
          </div>
          ${mainTree.runes.map((runeRow, index) => `
            <div class="runes-row ${index === 0 ? "keystone-row" : ""}">
              ${runeRow.map(rune => `
                <div class="rune-item ${!rune.active ? "inactive" : ""}" data-tooltip-id="rune${rune.id}">
                  <img src="${rune.data.image}" />
                </div>
                ${this.getTooltip({rune, ...rune.data}, `rune${rune.id}`, lang)}
              `).join("")}
            </div>
          `).join("")}
        </div>
        <div class="runes-tree secondary-tree">
          <div class="rune-header">
              <img src="${secondaryTree.data.image}" />
              <span>${secondaryTree.data.name[lang]}</span>
          </div>
          ${secondaryTree.runes.map((runeRow, index) => {
            const isShard = shardsData.find(shard => shard.id === runeRow[0].data.id)
            return `
              <div class="runes-row ${isShard ? "stat-shards-row" : ""}">
                ${runeRow.map(rune => `
                  <div class="rune-item ${!rune.active ? "inactive" : ""}" data-tooltip-id="rune${rune.id}">
                    <img src="${rune.data.image}" />
                  </div>
                  ${this.getTooltip({rune, ...rune.data}, `rune${rune.id}`, lang)}
                `).join("")}
              </div>
            `
          }).join("")}
        </div>
      </div>
    `
  }

  getTitleBlock(title, lang) {
    return `
      <div style="cursor: default" class="section-block section-block-subtitle img-subtitle"">
        <h3>${title[lang]}</h3>
      </div>    
    `
  }

  getItemTitleBlock(item, lang, hoverEffect = true) {
    return `   
      <div ${!hoverEffect ? 'style="cursor: default"' : ""} class="section-block section-block-subtitle img-subtitle" data-tooltip-id="item-title${item.id}">
        <img src="${item.image}" /> <h3>${item.name[lang]}</h3>
      </div>    
      ${hoverEffect ? this.getTooltip(item, `item-title${item.id}`, lang) : ""}
    `
  }

  getTextBlock(text, lang, data) {
    const replacedText = text[lang].replace(/\[.*?\]/g, (match) => {
      const nameMatch = match.match(/\(.*?\)/g)?.[0]?.replace(/[\(\)]/g, "")

      match = match.replace(/\(.*?\)/g, "")

      const foundData = data.find(dataItem => dataItem.id === match.replace(/[\[\]]/g, ""))
      if(!foundData) return ""
      return `
        <div class="text-tooltip" data-tooltip-id="text-tooltip${foundData.id}">
          <img src="${foundData.image}" />
          ${nameMatch ?? foundData.name[lang]}
        </div>
        ${this.getTooltip(foundData, `text-tooltip${foundData.id}`, lang)}
      `
    })
    return `
      <div class="section-block section-block-text">
       ${replacedText}
      </div>    
    `
  }

  getProsConsBlock(pros, cons, lang) {
    return `
      <div class="section-block pros-cons-block">
        <div class="item pros-block">
          <h3>${lang === "ru" ? "Сильные стороны" : "Strengths"}</h3>
          ${pros[lang].map(prosItem => `
            <div class="list-item">
              ${prosItem}
            </div>
          `).join("")}
        </div>
        <div class="item cons-block">
          <h3>${lang === "ru" ? "Слабые стороны" : "Weaknesses"}</h3>
          ${cons[lang].map(prosItem => `
            <div class="list-item">
              ${prosItem}
            </div>
          `).join("")}
        </div>
      </div>
    `
  }

  getTooltip(data, id, lang, alt = "") {
    return `
      <div class="tooltip-wrapper" id="${id}" style="display:none">
        <div class="tooltip">
          <div class="tooltip-header">
             <img src="${data.image}" alt="${alt}" /> <span class="tooltip-title">${data.name[lang]}</span>
          </div>
          ${data.description?.[lang] ?
            `<div class="tooltip-body">
              <div class="tooltip-info ${!data.cooldown ? "display-none" : ""}">
                ${lang === "ru" ? "Перезарядка" : "Cooldown"}: ${data.cooldown}
              </div>
              <div class="tooltip-description">
                ${data.description?.[lang]} 
              </div>
            </div>`
          : ""
        }
        </div>
      </div>
    `
  }
}
