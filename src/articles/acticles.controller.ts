import {
  Get,
  Controller,
  Render,
  Post,
  Body,
  Param,
  Delete,
  Put,
  Patch,
  UseGuards,
  UseInterceptors
} from '@nestjs/common';
import {ConfigService} from "../config/config.service";
import {CreateArticleDto} from "./dto/create-article.dto";
import {ArticlesService} from "./articles.service";
import {EditArticleDto} from "./dto/edit-article.dto";
import {AdminGuard} from "../auth/guards/admin.guard";
import {RoleInterceptor} from "../auth/interseptors/role.interseptor";
import {IsAdmin} from "../auth/decorators/isAdmin.decorator";

@Controller("/api/articles")
export class ArticlesController {
  constructor(
    private readonly config: ConfigService,
    private readonly articlesService: ArticlesService
  ) {}

  @Get()
  @UseInterceptors(RoleInterceptor)
  getArticles(@IsAdmin() isAdmin) {
    return this.articlesService.getArticles(isAdmin)
  }

  @Get("/search/:lang/:text")
  searchArticle(@Param("lang") lang: string, @Param("text") text: string) {
    return this.articlesService.searchArticle(text, lang)
  }

  @Get("/:id")
  getArticle(@Param("id") id: string) {
    return this.articlesService.getArticle(id)
  }

  @Delete("/:id")
  @UseGuards(AdminGuard)
  deleteArticle(@Param("id") id: string) {
    return this.articlesService.deleteArticle(id)
  }

  @Post()
  @UseGuards(AdminGuard)
  createArticle(@Body() body: CreateArticleDto) {
    return this.articlesService.createArticle(body)
  }

  @Patch("/:id")
  @UseGuards(AdminGuard)
  editArticle(@Body() body: EditArticleDto, @Param("id") id: string) {
    return this.articlesService.editArticle(id, body)
  }
}
