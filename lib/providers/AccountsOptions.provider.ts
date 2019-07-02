import {
  AccountsOptions,
  NestAccountsOptions,
  NestAccountsOptionsProvider,
} from '../interfaces/AccountsNestModuleOptions';
import { ACCOUNTS_JS_OPTIONS } from '../utils/accounts.constants';
import { isProvider } from '../utils/typeguards';

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
export function accountsOptionsToProvider(
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
