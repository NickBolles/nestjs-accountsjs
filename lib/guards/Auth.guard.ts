import { authenticated, User } from '@accounts/graphql-api';
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { GqlExecutionContext } from '@nestjs/graphql';
import { AuthValidatorFn } from '../decorators/AuthValidator.decorator';
import { AccountsSessionRequest } from '../interfaces/AccountsRequest';
import { AUTH_VALIDATOR_FUNCTIONS } from '../utils/accounts.constants';
import { GetFieldFromExecContext, GQLParam } from '../utils/GraphQLUtils';

// todo: allow customization of this
// todo: unify context better. It sounds like this will break see issue: https://github.com/nestjs/nest/issues/1581 and PR https://github.com/nestjs/nest/pull/2493
@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const ctx = GqlExecutionContext.create(context);
    const gqlCtx = ctx.getContext();
    if (gqlCtx) {
      try {
        const gqlParams: GQLParam = [ctx.getRoot(), ctx.getArgs(), gqlCtx, ctx.getInfo()];
        // use the authenticated function from accounts-js. All that's really needed is context
        await new Promise(resolve => authenticated(resolve)(...gqlParams));
        this.runValidators(context, gqlParams, gqlCtx.user);
        return true;
      } catch (e) {
        return false;
      }
    }
    const user = GetFieldFromExecContext(context, 'user');
    if (!user) {
      return false;
    }
    return this.runValidators(context, context.switchToHttp().getRequest(), user);
  }

  /**
   * Run the validators setup by AuthValidator decorator
   * @param context
   * @param param
   * @param user
   */
  async runValidators(
    context: ExecutionContext,
    param: AccountsSessionRequest | GQLParam,
    user: User,
  ): Promise<boolean> {
    // combine the validators from the class first, then the handler
    const validatorFns: AuthValidatorFn[] = [
      ...this.reflector.get(AUTH_VALIDATOR_FUNCTIONS, context.getClass()),
      ...this.reflector.get(AUTH_VALIDATOR_FUNCTIONS, context.getHandler()),
    ];

    // Run each function and store the value (either a boolean or a promise<boolean>) in the results array
    const results = await Promise.all(validatorFns.map(fn => fn(user, param, context)));

    return results.every(v => !!v); // Make sure that each promise resulted in a truthy value
  }
}
