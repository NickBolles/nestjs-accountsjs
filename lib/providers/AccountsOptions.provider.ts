import {
  AccountsOptions,
  NestAccountsOptions,
  NestAccountsOptionsProvider,
  AccountsOptionsFactory,
} from '../interfaces/AccountsNestModuleOptions';
import { ACCOUNTS_JS_OPTIONS } from '../utils/accounts.constants';
import { isProvider, isClassProvider, isExistingProvider } from '../utils/typeguards';
import { ClassProvider, ExistingProvider } from '@nestjs/common/interfaces';

/**
 * Takes the accounts options and coerces it to a custom Nest provider.
 * If the options look like a provider (it has a useClass, useFactory or useValue property)
 * then all this does is set the provide property to ACCOUNTS_JS_OPTIONS
 *
 * otherwise the value is put into a new custom providers useValue property
 *
 *
 * @param {AccountsOptions} options Either a POJO to use, or a Nest Custom provider
 */
export function accountsOptionsToProvider(options: AccountsOptions): NestAccountsOptionsProvider {
  let accountsProvider: NestAccountsOptionsProvider;

  if (!isProvider(options)) {
    return {
      provide: ACCOUNTS_JS_OPTIONS,
      useValue: options as NestAccountsOptions,
    };
  }

  if (isClassProvider(options) || isExistingProvider(options)) {
    return {
      provide: ACCOUNTS_JS_OPTIONS,
      inject: [(options as ClassProvider).useClass || (options as ExistingProvider).useExisting],
      useFactory: async (optionsFactory: AccountsOptionsFactory) => await optionsFactory.createAccountsOptions(),
    };
  }

  return {
    ...options,
    provide: ACCOUNTS_JS_OPTIONS,
  };
}
