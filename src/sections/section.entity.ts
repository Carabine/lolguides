import {Column, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn} from "typeorm"
import {Article} from "../articles/article.entity";
import {Block} from "../blocks/block.entity";
import {Translation} from "../translations/translation.entity";

@Entity("sections")
export class Section {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @OneToOne(() => Translation)
  @JoinColumn()
  title: Translation;

  @Column({unique: false})
  sortPosition: number

  @ManyToOne(type => Article, article => article.sections, {onDelete: "SET NULL"})
  article?: Article

  @OneToMany(type => Block, block => block.section, {onDelete: "CASCADE"})
  blocks?: Block[];
}
