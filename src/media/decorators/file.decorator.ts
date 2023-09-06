import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const FileDecorator = createParamDecorator(
  async (data, context: ExecutionContext) => {
    const request = context.switchToHttp().getRequest();
    const file = await request.file();
    return file;
  },
);
