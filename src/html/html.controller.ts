import {Get, Controller, Render, Post, Body, Param, Res, Redirect} from '@nestjs/common';
import {ConfigService} from "../config/config.service";
import {ArticlesService} from "../articles/articles.service";
import {HtmlService} from "./html.service";

@Controller()
export class HtmlController {
  constructor(
    private readonly config: ConfigService,
    private readonly htmlService: HtmlService
  ) {}

  @Redirect()
  @Get("/:lang/guides/:slug")
  async redirectArticles(@Param("lang") lang: "ru" | "en" = "en", @Param("slug") slug: string, @Res() res) {
    console.log(this.config.get("URL"))
    return { url: `${this.config.get("URL")}/${lang}/${slug}` };
  }
  
  @Get("/:lang/guides")
  @Render('guides.ejs')
  async redirectArticle(@Param("lang") lang: "ru" | "en" = "en", @Res() res) {
    return await this.htmlService.renderGuidesPage(lang)
  }

  @Get("/:lang/:slug")
  @Render('article.ejs')
  async renderArticlePage(@Param("lang") lang: "ru" | "en" = "en", @Param("slug") slug: string) {
    return await this.htmlService.renderArticlePage(lang, slug)
  }

  @Get("/:lang")
  @Render("articles.ejs")
  async renderMainPage(@Param("lang") lang: "ru" | "en" = "en") {
    return await this.htmlService.renderMainPage(lang)
  }

  @Get("/")
  @Render("articles.ejs")
  async renderMainPageEn(@Param("lang") lang: "ru" | "en" = "en") {
    return await this.htmlService.renderMainPage(lang)
  }


}
