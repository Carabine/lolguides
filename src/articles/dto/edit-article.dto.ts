import {BlockType} from "../../blocks/block-type.enum";

export class EditArticleDto {
  title: {id: string, ru: string, en: string}
  description: {id: string, ru: string, en: string}
  metaTags: {id: string, ru: string, en: string}
  headerTitle: {id: string, ru: string, en: string}
  headerSubtitle: {id: string, ru: string, en: string}
  slug: string
  imageUrl: string
  isPublished: boolean
  championId: string
  sections: {
    id?: string,
    title: {id: string, ru: string, en: string}
    blocks: {
      id?: string,
      type: BlockType,
      value?: string,
      text: {id?: string, ru: string, en: string}
    }[]
  }[]
}
