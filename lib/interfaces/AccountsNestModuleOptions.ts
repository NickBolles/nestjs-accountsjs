import { AccountsModuleConfig } from '@accounts/graphql-api';
import { AccountsExpressOptions } from '@accounts/rest-express/lib/types';
import { AccountsServerOptions } from '@accounts/server';
import { AuthenticationService } from '@accounts/types';
import {
  FactoryProvider,
  ModuleMetadata,
  ValueProvider,
  ClassProvider,
  ExistingProvider,
} from '@nestjs/common/interfaces';
import { NullableProp } from '../utils/typing-helpers';

//#region Components of Nestjs Accounts options
/**
 * Accounts Express options specific to the nest module
 */
export interface NestAccountsExpressOptions extends AccountsExpressOptions {
  /**
   * @default false
   */
  ignoreNestRoute?: boolean;
}

/**
 * Accounts graphql options
 */
export interface NestAccountsGraphQLOptions extends NullableProp<AccountsModuleConfig, 'accountsServer'> {}

/**
 * Accounts services to pass into accounts-server as the second constructor parameter
 */
export interface AccountsServices {
  [key: string]: AuthenticationService;
}

//#endregion Components of Nestjs Accounts options

/**
 * Accounts options for Nest.
 * Holds the config for different parts of the nestjs-accountsjs module
 */
export interface NestAccountsOptions {
  serverOptions: AccountsServerOptions;
  services?: AccountsServices;
  /**
   * rest-express options
   */
  REST?: NestAccountsExpressOptions | boolean;
  GraphQL?: NestAccountsGraphQLOptions | boolean;
}

export type NestAccountsOptionsPromise = Promise<NestAccountsOptions> | NestAccountsOptions;

//#region Interfaces for ways to provide NestAccountsOptions
/**
 * Factory class interface
 */
export interface AccountsOptionsFactory {
  createAccountsOptions(): NestAccountsOptionsPromise;
}
/**
 * Nest custom provider for NestAccountsOptions
 */
export type NestAccountsOptionsProvider =
  | ValueProvider<NestAccountsOptionsPromise>
  | FactoryProvider<NestAccountsOptionsPromise>
  | ClassProvider<AccountsOptionsFactory>
  | ExistingProvider<AccountsOptionsFactory>;

/**
 * Nest custom provider without the provide key because it will be defaulted in to ACCOUNTS_JS_OPTIONS internally
 */
export type NestAccountsOptionsPartialProvider = Omit<NestAccountsOptionsProvider, 'provide'>;

/**
 * AccountsOptions interface, any of these are valid inputs for the accountsOptions property of AccountsModuleOptions
 */
export type AsyncAccountsOptions = NestAccountsOptionsProvider | NestAccountsOptionsPartialProvider;

//#endregion Interfaces for ways to provide NestAccountsOptions

/**
 * We have 3 levels of options
 * First, Nest module options. This should contain the top module level options and extends the default nest module options
 * Second, we have the options for how the components in the module should be have, this is the NestAccountsOptions
 * Third, we have the accounts server options, Accounts server services, Rest and GraphQL Settings
 */

/**
 * Options for the actual AccountsJs Nest Module.
 *
 * Supports sending any valid Nest properties that you would normally set on a module, as well as using a custom provider
 */

export type AsyncNestAccountsOptions =
  | NestAccountsOptionsProvider
  | NestAccountsOptionsPartialProvider & Partial<ModuleMetadata>;
