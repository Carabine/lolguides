import { Length, Min, Max, IsUUID } from "class-validator";
import {BlockType} from "../../blocks/block-type.enum";

export class CreateArticleDto {
  title: {ru: string, en: string}
  description: {ru: string, en: string}
  metaTags: {ru: string, en: string}
  headerTitle: {ru: string, en: string}
  headerSubtitle: {ru: string, en: string}
  slug: string
  imageUrl: string
  isPublished: boolean
  sections: {
    title: {ru: string, en: string}
    blocks: {
      type: BlockType,
      value?: string,
      text: {ru: string, en: string}
    }[]
  }[]
}
