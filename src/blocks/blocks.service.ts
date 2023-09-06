import { Injectable } from "@nestjs/common";
import { FindOneOptions, Repository } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";
import {Block} from "./block.entity";
import {Section} from "../sections/section.entity";

@Injectable()
export class BlocksService {
  constructor(@InjectRepository(Block) private readonly repo: Repository<Block>) {}

  async findOne(options: FindOneOptions<Block>): Promise<Block | undefined> {
    return this.repo.findOne(options);
  }

  async createAndSave(options: Block): Promise<Block> {
    return this.repo.save(this.repo.create(options));
  }

  async update(block: Block) {
    return this.repo.update(block.id, block)
  }

  async save(block: Block): Promise<void> {
    await this.repo.save(block);
  }

  async findAll(): Promise<Block[]> {
    return this.repo.find();
  }

  async findById(id): Promise<Block> {
    return this.repo.findOne({where: {id}});
  }

  async deleteById(id: string): Promise<void> {
    const result = await this.repo.delete(id)

    if(result.affected === 0) {
      throw new Error("translation deleting error")
    }
  }
}
