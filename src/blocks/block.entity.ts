import {Entity, PrimaryGeneratedColumn, Column, PrimaryColumn, JoinColumn, OneToOne, ManyToOne} from "typeorm"
import {Translation} from "../translations/translation.entity";
import {BlockType} from "./block-type.enum";
import {Section} from "../sections/section.entity";

@Entity("blocks")
export class Block {
  @PrimaryGeneratedColumn("uuid")
  id: string

  @OneToOne(() => Translation)
  @JoinColumn()
  text?: Translation

  @Column({nullable: true, unique: false})
  value?: string

  @Column({unique: false})
  sortPosition: number

  @Column({unique: false})
  type: BlockType

  @ManyToOne(type => Section, section => section.blocks, {onDelete: "SET NULL"})
  section?: Section
}
