import { AccountsPassword } from '@accounts/password';
import { Module, Inject } from '@nestjs/common';
import { AccountsJsModule, AccountsOptionsFactory, AsyncNestAccountsOptions } from '../../dist';
import { UserDatabase } from '../shared/database.service';
import { ConfigService, ConfigModule } from 'nestjs-config';
import { resolve } from 'path';

class AppAccountsOptionsFactory implements AccountsOptionsFactory {
  constructor(@Inject(ConfigService) private readonly configService: ConfigService) {}
  createAccountsOptions(): AsyncNestAccountsOptions {
    return {
      serverOptions: {
        db: new UserDatabase(),
        tokenSecret: this.configService.get('auth.tokenSecret'),
      },
      services: {
        password: new AccountsPassword(),
      },
      REST: {
        /**
         * Create the REST router with a specific path prefix
         *
         * This will be used as a path prefix
         * ***Do not include a trailing slash.***
         * i.e. setting path to "/" will result in invalid paths //user and //password/register
         *
         * default value is "/accounts" which results in routes: /accounts/user /accounts/password/register
         *
         * Used in conjunction with the relative option. if relative = true (the default), this value
         * will be appended to the Nest Module path. This allows you to use nest-router or other means of defining
         * the module/s path.
         *
         * To mount at the server root with this path, set relative to false
         */
        path: this.configService.get('auth.path'),
        ignoreNestRoute: this.configService.get('auth.ignoreNestRoute'),
      },
    };
  }
}

@Module({
  imports: [
    ConfigModule.load(resolve(__dirname, 'config', '**/!(*.d).{ts,js}')), // mostly just for testing and injecting the path settings
    AccountsJsModule.registerAsync({ useClass: AppAccountsOptionsFactory }),
  ],
})
export class AppModule {}
