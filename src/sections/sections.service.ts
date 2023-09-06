import { Injectable } from "@nestjs/common";
import { FindOneOptions, Repository } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";
import {Section} from "./section.entity";

@Injectable()
export class SectionsService {
  constructor(@InjectRepository(Section) private readonly repo: Repository<Section>) {}

  async findOne(options: FindOneOptions<Section>): Promise<Section | undefined> {
    return this.repo.findOne(options);
  }

  async createAndSave(options: Section): Promise<Section> {
    return this.repo.save(this.repo.create(options));
  }

  async update(section: Section) {
    return this.repo.update(section.id, section)
  }

  async save(section: Section): Promise<void> {
    await this.repo.save(section);
  }

  async findAll(): Promise<Section[]> {
    return this.repo.find();
  }

  async findById(id): Promise<Section> {
    return this.repo.findOne({where: {id}});
  }

  async deleteById(id: string): Promise<void> {
    const result = await this.repo.delete(id)

    if(result.affected === 0) {
      throw new Error("translation deleting error")
    }
  }
}
