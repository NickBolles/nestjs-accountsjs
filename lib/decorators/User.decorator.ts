import { createParamDecorator } from '@nestjs/common';
import { AccountsSessionRequest } from '../interfaces/AccountsRequest';

export const User = createParamDecorator(
  (data, req: AccountsSessionRequest) => req.user,
);
