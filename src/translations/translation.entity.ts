import { Column, Entity, PrimaryColumn, PrimaryGeneratedColumn } from "typeorm";

@Entity("translations")
export class Translation {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({default: ""})
  en: string;

  @Column({default: ""})
  ru: string;
}
