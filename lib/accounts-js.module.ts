import accountsExpress from '@accounts/rest-express';
import AccountsServer from '@accounts/server';
import { Inject, Module } from '@nestjs/common';
import { MODULE_PATH } from '@nestjs/common/constants';
import { DynamicModule, MiddlewareConsumer, NestModule } from '@nestjs/common/interfaces';
import { resolve } from 'url';
import { debuglog } from 'util';
import { AccountsModuleOptions, NestAccountsOptions, AccountsOptions } from './interfaces/AccountsNestModuleOptions';
import { ACCOUNTS_JS_GRAPHQL, ACCOUNTS_JS_OPTIONS, ACCOUNTS_JS_SERVER } from './utils/accounts.constants';
import { buildAsyncProviders, buildProviders } from './utils/buildProviders';
import { getRESTOptions } from './utils/getRestOptions';
import { extractModuleMetadata } from './utils/extractModuleOptions';
const debug = debuglog('nestjs-accounts');

type NonServerNestAccountsOptions = Omit<NestAccountsOptions, 'serverOptions' | 'services'>;

@Module({})
export class AccountsJsModule implements NestModule {
  static register(server: AccountsServer, options?: NonServerNestAccountsOptions): DynamicModule;
  static register(options?: AccountsOptions): DynamicModule;
  static register(
    serverOrOptions: AccountsServer | AccountsOptions,
    options?: NonServerNestAccountsOptions,
  ): DynamicModule {
    let providers = [];

    if (serverOrOptions instanceof AccountsServer) {
      providers = buildProviders(options, serverOrOptions);
    } else {
      providers = buildProviders(serverOrOptions);
    }

    return {
      module: AccountsJsModule,
      providers,
      exports: [ACCOUNTS_JS_SERVER, ACCOUNTS_JS_OPTIONS, ACCOUNTS_JS_GRAPHQL],
    };
  }
  /**
   * Register and configure the AccountsJsModule.
   *
   * @param {AccountsModuleOptions} metadata for the accounts module
   * @returns {DynamicModule} Nest module
   */
  // todo: break into registerAsync to simplify things
  static registerAsync(metadata: AccountsModuleOptions): DynamicModule {
    return {
      module: AccountsJsModule,
      ...extractModuleMetadata(metadata),
      providers: buildAsyncProviders(metadata),
      exports: [ACCOUNTS_JS_SERVER, ACCOUNTS_JS_OPTIONS, ACCOUNTS_JS_GRAPHQL],
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
      const { path, relative = true, ...opts } = getRESTOptions(this.options);
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
        .apply(accountsExpress(this.accountsServer, { path: '', ...opts }))
        .forRoutes(pathToUse);
    }
  }
}
