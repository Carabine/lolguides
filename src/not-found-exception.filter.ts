import { Catch, ArgumentsHost, NotFoundException, ExceptionFilter } from '@nestjs/common';

@Catch(NotFoundException)
export class NotFoundExceptionFilter implements ExceptionFilter {
  catch(_exception: NotFoundException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    console.log("404")
    response.redirect('/en/guides');
  }
}
