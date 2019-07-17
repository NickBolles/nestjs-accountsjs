import { Provider } from '@nestjs/common';
import { AccountsSessionInterceptorProvider } from '../interceptors/ResumeSession.interceptor';
import { AccountsModuleOptions } from '../interfaces/AccountsNestModuleOptions';
import { accountsOptionsToProvider } from '../providers/AccountsOptions.provider';
import { AccountsServerProvider } from '../providers/AccountsServer.provider';
import { ACCOUNTS_JS_SERVER } from './accounts.constants';
import { GraphQLModuleProvider } from '../providers/GraphQLModule';

/**
 * Check and get the providers from the options passed in.
 * This will create the custom providers for the ACCOUNTS_JS_SERVER and ACCOUNTS_JS_OPTIONS
 * so that they can be injected anywhere with Nest.
 *
 * This will also create the AccountsSessionInterceptor as a global interceptor
 * so that the accounts session is restored on every request.
 * s
 * @param {AccountsModuleOptions} options for the accounts module
 */
export function buildProviders(options: AccountsModuleOptions): Provider[] {
  const { useServer, accountsOptions, providers = [] } = options;

  if (useServer && accountsOptions) {
    throw new Error('accountsOptions will be ignored when passing an existing server instance');
  }

  let serverProvider: Provider = AccountsServerProvider;
  // If an existing server instance is passed in, use that instead of the factory
  if (useServer) {
    serverProvider = {
      provide: ACCOUNTS_JS_SERVER,
      useValue: useServer,
    };
  }

  return [
    ...providers,
    AccountsSessionInterceptorProvider,
    accountsOptionsToProvider(accountsOptions),
    serverProvider,
    GraphQLModuleProvider,
  ];
}
