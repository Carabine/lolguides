import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  PrimaryColumn,
  JoinColumn,
  OneToOne,
  OneToMany,
  ManyToOne
} from "typeorm"
import {Translation} from "../translations/translation.entity";
import {Section} from "../sections/section.entity";
import {Block} from "../blocks/block.entity";
import {RiotEntity} from "../riot/riot-entity.entity";

@Entity("articles")
export class Article {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @OneToOne(() => Translation)
  @JoinColumn()
  title: Translation;

  @OneToOne(() => Translation)
  @JoinColumn()
  description: Translation;

  @OneToOne(() => Translation)
  @JoinColumn()
  metaTags: Translation;

  @OneToOne(() => Translation)
  @JoinColumn()
  headerTitle: Translation;

  @OneToOne(() => Translation)
  @JoinColumn()
  headerSubtitle: Translation;

  @Column({default: "", unique: false})
  slug: string

  @Column({unique: false})
  imageUrl: string

  @Column({unique: false})
  isPublished: boolean

  @Column({default: new Date().getTime()})
  created: number;

  @OneToMany(type => Section, section => section.article, {onDelete: "CASCADE"})
  sections?: Section[];

  @ManyToOne(type => RiotEntity, riotEntity => riotEntity.articles, {onDelete: "SET NULL"})
  champion?: RiotEntity
}
