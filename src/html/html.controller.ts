import {Get, Controller, Render, Post, Body, Param} from '@nestjs/common';
import {ConfigService} from "../config/config.service";
import {ArticlesService} from "../articles/articles.service";
import {HtmlService} from "./html.service";

@Controller("/:lang/guides")
export class HtmlController {
  constructor(
    private readonly config: ConfigService,
    private readonly htmlService: HtmlService
  ) {}

  @Get()
  @Render("articles.ejs")
  async renderArticlesPage(@Param("lang") lang: "ru" | "en") {
    return await this.htmlService.renderArticlesPage(lang)
  }

  @Get("/test")
  @Render('article-test.ejs')
  renderArticleTest() {
    return { url: this.config.get("URL")};
  }

  @Get("/:slug")
  @Render('article.ejs')
  async renderArticlePage(@Param("lang") lang: "ru" | "en", @Param("slug") slug: string) {
    return await this.htmlService.renderArticlePage(lang, slug)
  }


}
