import { AccountsPassword } from '@accounts/password';
import { Module } from '@nestjs/common';
import { ConfigModule } from 'nestjs-config';
import { resolve } from 'path';
import { AccountsJsModule } from '../../dist';
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
        // With no options you can just use true
        // REST: true,
        REST: {
          path: '/',
          transformOAuthResponse: loginResult => loginResult,
          onOAuthError: (req, res, err) => console.log('Oauth Error'),
          onOAuthSuccess: (req, res, err) => console.log('Oauth Success'),
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
