import accountsExpress from '@accounts/rest-express';
import AccountsServer from '@accounts/server';
import { Inject, Module } from '@nestjs/common';
import { MODULE_PATH } from '@nestjs/common/constants';
import {
  DynamicModule,
  MiddlewareConsumer,
  NestModule,
} from '@nestjs/common/interfaces';
import { resolve } from 'url';
import { debuglog } from 'util';
import {
  AccountsModuleOptions,
  NestAccountsOptions,
} from './interfaces/AccountsNestModuleOptions';
import {
  ACCOUNTS_JS_GRAPHQL,
  ACCOUNTS_JS_OPTIONS,
  ACCOUNTS_JS_SERVER,
} from './utils/accounts.constants';
import { buildProviders } from './utils/buildProviders';
import { getRESTOptions } from './utils/getRestOptions';
const debug = debuglog('nestjs-accounts');

@Module({})
export class AccountsJsModule implements NestModule {
  /**
   * Register and configure the AccountsJsModule.
   *
   * @param {AccountsModuleOptions} metadata for the accounts module
   * @returns {DynamicModule} Nest module
   */
  static register(metadata: AccountsModuleOptions): DynamicModule {
    const { accountsOptions, useServer, ...AccountsModuleOptions } = metadata;

    return {
      module: AccountsJsModule,
      ...AccountsModuleOptions,
      providers: buildProviders(metadata),
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
