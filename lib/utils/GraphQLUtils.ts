import { AccountsModuleContext } from '@accounts/graphql-api';
import { AccountsSessionRequest } from '../interfaces/AccountsRequest';
import { isArray } from 'util';
import { ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';

type GQLParam = [any, any, AccountsModuleContext & RequestContext, any]; // [root,args,context,info]

interface RequestContext {
  req?: AccountsSessionRequest;
}

type Context = AccountsModuleContext & RequestContext;

export function getFieldFromDecoratorParams<K extends keyof AccountsSessionRequest>(
  param: AccountsSessionRequest | GQLParam,
  field: K,
  ...fields: any
): AccountsSessionRequest[K];
export function getFieldFromDecoratorParams<K extends keyof Context>(
  param: AccountsSessionRequest | GQLParam,
  field: K,
  ...fields: any
): Context[K];
export function getFieldFromDecoratorParams(param: AccountsSessionRequest | GQLParam, ...fields: any): any {
  if (isGQLParam(param)) {
    const ctx = getGQLContext(param);
    return (ctx && deepGet(ctx, fields)) || (ctx.req && deepGet(ctx.req, fields));
  }
  return deepGet(param, fields) || null;
}

export function isGQLParam(obj: any): obj is GQLParam {
  return isArray(obj) && obj.length === 4; // todo: be a litle smarter about this
}
export function getGQLContext(param: AccountsSessionRequest | GQLParam): Context | undefined {
  return isGQLParam(param) && param[2];
}

function deepGet(obj, fields: any[]) {
  if (!obj || !fields || !fields.length) return null;

  const field = fields.shift();
  return !fields.length ? obj[field] : deepGet(obj[field], fields);
}

export function GetFieldFromExecContext(context: ExecutionContext, ...fields: any[]): any {
  const ctx = GqlExecutionContext.create(context);
  const gqlCtx = ctx.getContext();
  if (gqlCtx) {
    return deepGet(gqlCtx, fields);
  }
  const req = context.switchToHttp().getRequest() as AccountsSessionRequest;
  return deepGet(req, fields);
}
