import { isBoolean } from 'util';
import {
  NestAccountsOptions,
  NestAccountsExpressOptions,
} from '../interfaces/AccountsNestModuleOptions';

export function getRESTOptions(
  options: NestAccountsOptions,
): NestAccountsExpressOptions {
  return isBoolean(options.REST) ? {} : options.REST;
}
