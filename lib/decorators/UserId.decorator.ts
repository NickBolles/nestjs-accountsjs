import { createParamDecorator } from '@nestjs/common';
import { AccountsSessionRequest } from '../interfaces/AccountsRequest';

export const UserId = createParamDecorator(
  (data, req: AccountsSessionRequest) => req.user && req.user.UserId,
);
