import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import {ConfigService} from "../../config/config.service";

@Injectable()
export class AdminGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private readonly config: ConfigService
  ) { }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest()
    const apiKey = this.config.get("API_KEY")
    if (apiKey && request.headers["x-api-key"] && apiKey === request.headers["x-api-key"]) {
      return true
    }
    return false
  }
}
