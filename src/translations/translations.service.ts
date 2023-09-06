import { Injectable } from "@nestjs/common";
import { FindOneOptions, Repository } from "typeorm";
import { Translation } from "./translation.entity";
import { InjectRepository } from "@nestjs/typeorm";

@Injectable()
export class TranslationsService {
  constructor(@InjectRepository(Translation) private readonly repo: Repository<Translation>) {}

  async findOne(options: FindOneOptions<Translation>): Promise<Translation | undefined> {
    return this.repo.findOne(options);
  }

  async createAndSave(options: Translation): Promise<Translation> {
    return this.repo.save(this.repo.create(options));
  }

  async update(translation: Translation) {
    return this.repo.update(translation.id, translation)
  }

  async save(translation: Translation): Promise<Translation> {
    return await this.repo.save(translation);
  }

  async findAll(): Promise<Translation[]> {
    return this.repo.find();
  }

  async deleteById(id: string): Promise<void> {
    const result = await this.repo.delete(id)

    if(result.affected === 0) {
      throw new Error("translation deleting error")
    }
  }

  async deleteUnusedTranslations(): Promise<void> {
    const translations = await this.findAll()

    await Promise.all(translations.map(async translation => {
      // const foundTranslation = await this.findOne({
      //   where: [
      //     {
      //       name: translation,
      //     },
      //     {
      //       description: translation
      //     }
      //   ]
      // })
      // if(!foundTranslation) {
      try {
        console.log(123)
        await this.deleteById(translation.id)
        console.log(321)
      } catch(err) {
        //console.log(err)
      }
      //}
    }))
  }
}
