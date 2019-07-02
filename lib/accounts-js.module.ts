import accountsExpress from '@accounts/rest-express';
import AccountsServer from '@accounts/server';
import { Inject, Module, Provider } from '@nestjs/common';
import { MODULE_PATH } from '@nestjs/common/constants';
import {
  DynamicModule,
  MiddlewareConsumer,
  NestModule,
} from '@nestjs/common/interfaces';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { resolve } from 'url';
import { debuglog } from 'util';
import { AccountsSessionInterceptor } from './interceptors/ResumeSession.interceptor';
import {
  AccountsModuleOptions as AccountsModuleMetadata,
  AccountsOptions,
  NestAccountsOptions,
} from './interfaces/AccountsNestModuleOptions';
import { NestAccountsOptionsProvider } from './interfaces/AccountsNestModuleOptions';
import {
  ACCOUNTS_JS_OPTIONS,
  ACCOUNTS_JS_SERVER,
  ACCOUNTS_JS_GRAPHQL,
} from './utils/accounts.constants';
import { getRESTOptions } from './utils/getRestOptions';
import { isProvider } from './utils/typeguards';
import { AccountsModule } from '@accounts/graphql-api';
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
      providers: this.getProviders(metadata),
    };
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
  private static getProviders(options: AccountsModuleMetadata) {
    const { useServer, accountsOptions, providers = [] } = options;

    if (useServer && accountsOptions) {
      throw new Error(
        'accountsOptions will be ignored when passing an existing server instance',
      );
    }

    let serverProvider: Provider = accountsServerFactory;
    // If an existing server instance is passed in, use that instead of the factory
    if (useServer) {
      serverProvider = {
        provide: ACCOUNTS_JS_SERVER,
        useValue: useServer,
      };
    }

    return [
      ...providers,
      {
        provide: APP_INTERCEPTOR,
        useClass: AccountsSessionInterceptor,
      },
      this.accountsOptionsToProvider(accountsOptions),
      serverProvider,
    ];
  }

  /**
   * Takes the accounts options and coorces it to a custom Nest provider.
   * If the options look like a provider (it has a useClass, useFactory or useValue property)
   * then all this does is set the provide property to ACCOUNTS_JS_OPTIONS
   *
   * otherwise the value is put into a new custom providers useValue property
   *
   *
   * @param {AccountsOptions} options Either a POJO to use, or a Nest Custom provider
   */
  private static accountsOptionsToProvider(
    options: AccountsOptions,
  ): NestAccountsOptionsProvider {
    let accountsProvider: NestAccountsOptionsProvider;

    if (isProvider(options)) {
      accountsProvider = options;
      // Default in the provider so that consumers don't have to
      if (!(accountsProvider as any).provide) {
        (accountsProvider as any).provide = ACCOUNTS_JS_OPTIONS;
      }
    } else {
      accountsProvider = {
        provide: ACCOUNTS_JS_OPTIONS,
        useValue: options as NestAccountsOptions,
      };
    }

    return accountsProvider;
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
    const { path, relative = true, ...opts } = getRESTOptions(this.options);
    const nestPath = Reflect.getMetadata(MODULE_PATH, AccountsJsModule);
    let pathToUse: string;
    if (relative && nestPath) {
      pathToUse = resolve(nestPath, path || '');
    } else {
      // absolute
      pathToUse = path || '/accounts';
    }

    if (this.options.REST) {
      debug(`mounting @accounts/rest-express on path '${pathToUse}'`);
      consumer
        // forRoutes will scope this middleware to it's route and trim the prefix, we'll
        // mount the accountsExpress middleware without a path and use forRoutes to define the prefix
        .apply(accountsExpress(this.accountsServer, { path: '', ...opts }))
        .forRoutes(pathToUse);
    }
  }
}

const accountsServerFactory = {
  provide: ACCOUNTS_JS_SERVER,
  useFactory: (options: NestAccountsOptions) => {
    const { serverOptions, services } = options;
    return new AccountsServer(serverOptions, services);
  },
  inject: [ACCOUNTS_JS_OPTIONS],
};

const graphQLModuleFactory: Provider<typeof AccountsModule> = {
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

// todo: auth guard
