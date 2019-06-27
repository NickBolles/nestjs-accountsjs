import { AccountsPassword } from '@accounts/password';
import { Module } from '@nestjs/common';
import { ConfigModule } from 'nestjs-config';
import { resolve } from 'path';
import { AccountsJsModule } from '../../accounts-js.module';
import { UserDatabase } from '../shared/database.service';

@Module({
  imports: [
    ConfigModule.load(resolve(__dirname, 'config', '**/!(*.d).{ts,js}')),
    AccountsJsModule.register({
      providers: [UserDatabase],
      accountsOptions: {
        serverOptions: {
          db: new UserDatabase(),
          tokenSecret: 'secret',
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
          path: '/myroute', // route examples: /myroute/user, /myroute/password/register etc
          // path: "", // route examples: /user, /password/register etc.
          relative: false, // default: true
        },
      },
    }),
  ],
})
export class AppModule {}
