import { createParamDecorator } from '@nestjs/common';
import { Request } from 'express';

export const AuthToken = createParamDecorator((data, req: Request) => {
  return (req as any).authToken; // todo: type the request correctly
});
