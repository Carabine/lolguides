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
  
  @Redirect()
  @Get("/:lang/guides")
  async redirectArticle(@Param("lang") lang: "ru" | "en" = "en", @Res() res) {
    return { url: `${this.config.get("URL")}/${lang == "en" ? "" : lang }` };
  }

  @Get("/:lang/:slug")
  @Render('article.ejs')
  async renderArticlePage(@Param("lang") lang: "ru" | "en" = "en", @Param("slug") slug: string) {
    return await this.htmlService.renderArticlePage(lang, slug)
  }

  @Get("/:lang")
  @Render("articles.ejs")
  async renderArticlesPage(@Param("lang") lang: "ru" | "en" = "en") {
    return await this.htmlService.renderArticlesPage(lang)
  }

  @Get("/")
  @Render("articles.ejs")
  async renderMainPage(@Param("lang") lang: "ru" | "en" = "en") {
    return await this.htmlService.renderArticlesPage(lang)
  }


}
