import { ACCOUNTS_JS_SERVER, ACCOUNTS_JS_OPTIONS } from '..';
import { NestAccountsOptions } from '../interfaces/AccountsNestModuleOptions';
import AccountsServer from '@accounts/server';

export const AccountsServerProvider = {
  provide: ACCOUNTS_JS_SERVER,
  useFactory: (options: NestAccountsOptions) => {
    const { serverOptions, services } = options;
    return new AccountsServer(serverOptions, services);
  },
  inject: [ACCOUNTS_JS_OPTIONS],
};
