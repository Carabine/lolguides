import {Entity, Column, PrimaryColumn, JoinColumn, OneToOne, OneToMany} from "typeorm"
import {Translation} from "../translations/translation.entity";
import {RiotEntityType} from "./riot-entity-type.enum";
import {Section} from "../sections/section.entity";
import {Article} from "../articles/article.entity";

@Entity("riot_entities")
export class RiotEntity {
  @PrimaryColumn()
  id: string

  @OneToOne(() => Translation)
  @JoinColumn()
  name: Translation;

  @OneToOne(() => Translation)
  @JoinColumn()
  description?: Translation;

  @Column({unique: false})
  image: string

  @Column({unique: false, nullable: true})
  cooldown?: string

  @Column({unique: false})
  type: RiotEntityType

  @OneToMany(type => Article, article => article.champion, {onDelete: "CASCADE"})
  articles?: Article[];
}
