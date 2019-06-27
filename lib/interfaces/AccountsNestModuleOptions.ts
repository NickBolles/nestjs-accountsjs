import { AccountsExpressOptions } from '@accounts/rest-express/lib/types';
import AccountsServer, { AccountsServerOptions } from '@accounts/server';
import { AuthenticationService } from '@accounts/types';
import { Provider } from '@nestjs/common';
import { ModuleMetadata } from '@nestjs/common/interfaces';
import { Request, Response } from 'express';

/**
 * We have 3 levels of options
 * First, Nest module options. This should contain the module level options and extends the default nest module options
 * Second, we have the options for how the components in the module should be have
 * Third, we have the accounts server options, this includes constructor arguments and services
 */

/**
 * Accounts Express options specific to the nest module
 */
export interface NestAccountsExpressOptions extends AccountsExpressOptions {
  /**
   * @default false
   */
  relative?: boolean;
}

export interface AccountsServices {
  [key: string]: AuthenticationService;
}

/**
 * Accounts options for Nest.
 * Holds the config for different parts of the accountsjs module
 */
export interface NestAccountsOptions {
  serverOptions: AccountsServerOptions;
  services?: AccountsServices;
  /**
   * rest-express options
   */
  REST?: NestAccountsExpressOptions | boolean;
}

/**
 * Nest custom provider for NestAccountsOptions
 */
export type NestAccountsOptionsProvider = Provider<NestAccountsOptions>;
/**
 * Nest custom provider without the provide key because it will be defaulted in to ACCOUNTS_JS_OPTIONS internally
 */
export type NestAccountsOptionsPartialProvider = Omit<
  NestAccountsOptionsProvider,
  'provide'
>;
/**
 * AccountsOptions interface, any of these are valid inputs for the accountsOptions property of AccountsModuleOptions
 */
export type AccountsOptions =
  | NestAccountsOptions
  | NestAccountsOptionsProvider
  | NestAccountsOptionsPartialProvider;
/**
 * Options for the AccountsJs Nest Module.
 *
 * Supports sending any valid Nest properties that you would normally set on a module
 */

export interface AccountsModuleOptions extends Partial<ModuleMetadata> {
  /**
   * Pass in an AccountsServer instance for the module to use.
   *
   * This will ignore the accountsOptions, because it assumes that you've already configured
   * the server how you want it to work.
   */
  useServer?: AccountsServer;
  /**
   * Either a POJO or a Nest custom provider that results in an AccountsOptions for the module to use
   */
  accountsOptions?: AccountsOptions;
}
