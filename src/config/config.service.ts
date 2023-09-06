import { Injectable } from '@nestjs/common';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class ConfigService {
  private readonly envConfig: { [key: string]: string };

  constructor(filePath: string) {
    console.log('path.resolve(__dirname) ',path.resolve(__dirname))
    this.envConfig = dotenv.parse(fs.readFileSync(path.resolve(filePath)));
  }

  public get(key: string): string {
    return this.envConfig[key];
  }

  public list(): { [key: string]: string } {
    return this.envConfig;
  }

  public getArray(key: string): string[] {
    return this.envConfig[key].split(",")
  }
}
