import { createParamDecorator } from '@nestjs/common';
import { Request } from 'express';

export const UserAgent = createParamDecorator((data, req: Request) => {
  let userAgent: string = (req.headers['user-agent'] as string) || '';
  if (req.headers['x-ucbrowser-ua']) {
    // special case of UC Browser
    userAgent = req.headers['x-ucbrowser-ua'] as string;
  }
  return userAgent;
});
