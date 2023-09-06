import {Reflector} from "@nestjs/core";
import {ConfigService} from "../../config/config.service";
import {CallHandler, ExecutionContext, Injectable, NestInterceptor} from "@nestjs/common";
import {Observable, tap} from "rxjs";

@Injectable()
export class RoleInterceptor implements NestInterceptor {
  constructor(
    private readonly config: ConfigService
  ) { }
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest()
    const apiKey = this.config.get("API_KEY")

    if (apiKey && request.headers["x-api-key"] && apiKey === request.headers["x-api-key"]) {
      request.role = "ADMIN"
    } else {
      request.role = "USER"
    }

    return next.handle()
  }
}
