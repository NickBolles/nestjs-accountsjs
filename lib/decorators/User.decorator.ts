import { createParamDecorator } from '@nestjs/common';
import {} from '@nestjs/graphql';
import { isArray } from 'util';
import { AccountsSessionRequest } from '../interfaces/AccountsRequest';

type GQLParam = [any, any, any, any]; // [root,args,context,info]

function isGQLParam(obj: any): obj is GQLParam {
  return isArray(obj) && obj.length === 4; // todo: be a litle smarter about this
}

export const CurrentUser = createParamDecorator(
  (_data, param: AccountsSessionRequest | GQLParam) => {
    let req = param as AccountsSessionRequest;

    if (isGQLParam(param)) {
      const ctx = param[2];
      if (ctx.user) return ctx.user;
      req = ctx.req;
    }

    return req.user;
  },
);
