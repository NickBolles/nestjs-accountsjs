import AccountsServer from '@accounts/server';
import { CanActivate, ExecutionContext, Inject, Injectable } from '@nestjs/common';
import { Observable } from 'rxjs';
import { ACCOUNTS_JS_SERVER } from '../utils/accounts.constants';
import { GetFieldFromExecContext } from '../utils/GraphQLUtils';

// todo: allow customization of this
// todo: unify context better. It sounds like this will break see issue: https://github.com/nestjs/nest/issues/1581 and PR https://github.com/nestjs/nest/pull/2493
@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    @Inject(ACCOUNTS_JS_SERVER)
    private readonly accountsServer: AccountsServer,
  ) {}

  canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    return !!GetFieldFromExecContext(context);
  }
}
