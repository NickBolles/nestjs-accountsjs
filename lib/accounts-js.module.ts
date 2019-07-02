import accountsExpress from '@accounts/rest-express';
import AccountsServer from '@accounts/server';
import { Inject, Module, Provider } from '@nestjs/common';
import { MODULE_PATH } from '@nestjs/common/constants';
import {
  DynamicModule,
  MiddlewareConsumer,
  NestModule,
} from '@nestjs/common/interfaces';
import { resolve } from 'url';
import { debuglog } from 'util';
import { AccountsSessionInterceptorProvider } from './interceptors/ResumeSession.interceptor';
import {
  AccountsModuleOptions as AccountsModuleMetadata,
  AccountsOptions,
  NestAccountsOptions,
  NestAccountsOptionsProvider,
} from './interfaces/AccountsNestModuleOptions';
import { AccountsServerProvider } from './providers/AccountsServer.provider';
import { GraphQLModuleProvider } from './providers/GraphQLModule';
import {
  ACCOUNTS_JS_GRAPHQL,
  ACCOUNTS_JS_OPTIONS,
  ACCOUNTS_JS_SERVER,
} from './utils/accounts.constants';
import { getRESTOptions } from './utils/getRestOptions';
import { isProvider } from './utils/typeguards';
import { accountsOptionsToProvider } from './providers/AccountsOptions.provider';
const debug = debuglog('nestjs-accounts');

@Module({
  exports: [ACCOUNTS_JS_SERVER, ACCOUNTS_JS_OPTIONS, ACCOUNTS_JS_GRAPHQL],
})
export class AccountsJsModule implements NestModule {
  /**
   * Register and configure the AccountsJsModule.
   *
   * @param {AccountsModuleMetadata} metadata for the accounts module
   * @returns {DynamicModule} Nest module
   */
  static register(metadata: AccountsModuleMetadata): DynamicModule {
    const { accountsOptions, useServer, ...accountsModuleMetadata } = metadata;

    return {
      module: AccountsJsModule,
      ...accountsModuleMetadata,
      providers: buildProviders(metadata),
    };
  }

  constructor(
    @Inject(ACCOUNTS_JS_SERVER) private readonly accountsServer: AccountsServer,
    @Inject(ACCOUNTS_JS_OPTIONS) private readonly options: NestAccountsOptions,
  ) {}
  /**
   * Mount the accountsExpress middleware
   *
   * @param consumer
   */
  configure(consumer: MiddlewareConsumer) {
    if (this.options.REST) {
      configureREST(consumer, this.options, this.accountsServer);
    }
  }
}

function configureREST(
  consumer: MiddlewareConsumer,
  options: NestAccountsOptions,
  accountsServer: AccountsServer,
) {
  const { path, relative = true, ...opts } = getRESTOptions(options);
  const nestPath = Reflect.getMetadata(MODULE_PATH, AccountsJsModule);

  let pathToUse: string;
  if (relative && nestPath) {
    pathToUse = resolve(nestPath, path || '');
  } else {
    // absolute path
    pathToUse = path || '/accounts';
  }

  debug(`mounting @accounts/rest-express on path '${pathToUse}'`);
  consumer
    // forRoutes will scope this middleware to it's route and trim the prefix, we'll
    // mount the accountsExpress middleware without a path and use forRoutes to define the prefix
    .apply(accountsExpress(accountsServer, { path: '', ...opts }))
    .forRoutes(pathToUse);
}

/**
 * Check and get the providers from the options passed in.
 * This will create the custom providers for the ACCOUNTS_JS_SERVER and ACCOUNTS_JS_OPTIONS
 * so that they can be injected anywhere with Nest.
 *
 * This will also create the AccountsSessionInterceptor as a global interceptor
 * so that the accounts session is restored on every request.
 * s
 * @param {AccountsModuleMetadata} options for the accounts module
 */
function buildProviders(options: AccountsModuleMetadata): Provider[] {
  const { useServer, accountsOptions, providers = [] } = options;

  if (useServer && accountsOptions) {
    throw new Error(
      'accountsOptions will be ignored when passing an existing server instance',
    );
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

// todo: auth guard
