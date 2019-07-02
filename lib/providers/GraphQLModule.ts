import { Provider } from '@graphql-modules/di';
import { AccountsModule } from '@accounts/graphql-api';
import {
  ACCOUNTS_JS_GRAPHQL,
  ACCOUNTS_JS_OPTIONS,
  ACCOUNTS_JS_SERVER,
} from '..';
import { NestAccountsOptions } from '../interfaces/AccountsNestModuleOptions';
import AccountsServer from '@accounts/server';
import { FactoryProvider } from '@nestjs/common/interfaces';

export const GraphQLModuleProvider: FactoryProvider<typeof AccountsModule> = {
  provide: ACCOUNTS_JS_GRAPHQL,
  useFactory: (
    options: NestAccountsOptions,
    accountsServer: AccountsServer,
  ) => {
    let { GraphQL = false } = options;

    if (!GraphQL) {
      return null;
    } else if (GraphQL === true) {
      GraphQL = {};
    }

    return AccountsModule.forRoot({ accountsServer, ...GraphQL });
  },
  inject: [ACCOUNTS_JS_OPTIONS, ACCOUNTS_JS_SERVER],
};
