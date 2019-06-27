import { createParamDecorator } from '@nestjs/common';
import { Request } from 'express';
import { getClientIp } from 'request-ip';

export const ClientIP = createParamDecorator((data, req: Request) => {
  return getClientIp(req);
});
