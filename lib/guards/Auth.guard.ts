import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Observable } from 'rxjs';
import { GetFieldFromExecContext } from '../utils/GraphQLUtils';

// todo: allow customization of this
// todo: unify context better. It sounds like this will break see issue: https://github.com/nestjs/nest/issues/1581 and PR https://github.com/nestjs/nest/pull/2493
@Injectable()
export class AuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    return !!GetFieldFromExecContext(context);
  }
}
