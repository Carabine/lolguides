import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const IsAdmin = createParamDecorator(
  (_: undefined, context: ExecutionContext): boolean => {
    const request = context.switchToHttp().getRequest()
    if (request.role === "ADMIN") {
      return true
    }
    return false
  },
);
