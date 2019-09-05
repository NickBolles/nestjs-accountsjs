import { AccountsPassword } from '@accounts/password';
import { Module } from '@nestjs/common';
import { ConfigModule } from 'nestjs-config';
import { resolve } from 'path';
import { AccountsJsModule } from '../../';
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
      },
      /**
       * tip: The above is a shortcut for the custom provider and is equal to the following.
       *
       * accountsOptions: {
       *    provide: ACCOUNTS_JS_OPTIONS,
       *    useValue: {
       *      serverOptions: {
       *        db: new UserDatabase(),
       *        tokenSecret: "secret"
       *      },
       *      services: {
       *        password: new AccountsPassword()
       *      }
       *    }
       * }
       */
    }),
  ],
})
export class AppModule {}
