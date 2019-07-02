import { AccountsPassword } from '@accounts/password';
import { Module } from '@nestjs/common';
import { ConfigModule } from 'nestjs-config';
import { resolve } from 'path';
// replace the below line with "import { AccountsJsModule } from '@nickbolles/accountsjs-nest';"
import { AccountsJsModule } from '../../lib/accounts-js.module';
import { UserDatabase } from '../shared/database.service';
import { GraphQLModule } from '@nestjs/graphql';
import { ACCOUNTS_JS_GRAPHQL } from '../../lib/utils/accounts.constants';
import { AccountsModule } from '@accounts/graphql-api';

@Module({
  imports: [
    ConfigModule.load(resolve(__dirname, 'config', '**/!(*.d).{ts,js}')),
    AccountsJsModule.register({
      providers: [UserDatabase],
      accountsOptions: {
        inject: [UserDatabase],
        useFactory: userDatabase => {
          return {
            serverOptions: {
              db: userDatabase,
              tokenSecret: 'secret',
            },
            services: {
              password: new AccountsPassword(),
            },
            GraphQL: {
              /**
               * Don't worry about this property the module will set this
               * to the resolved ACCOUNTS_JS_SERVER provider.
               * If for some reason you want to use a different server than
               * the one that's resolved you can pass it though.
               *
               */

              // accountsServer: yourServer
              /**
               * Any other Graphql module options
               * https://accounts-js.netlify.com/docs/transports/graphql#customization
               *
               * note that the defaults are probably good for you, but the option's there
               */
              headerName: 'MyCustomHeader', // default "Authorization"
              rootQueryName: 'RootQuery', // default "Query"
              rootMutationName: 'RootMutation', // default "Mutation"
              extend: false, // default true
              withSchemaDefinition: true, // default: false
              userAsInterface: true, // default: false
              /**
               * For more on extending the user type see the accounts-js documentation
               * https://accounts-js.netlify.com/docs/transports/graphql#extending-user
               *
               */
            },
          };
        },
      },
    }),
    /**
     * Now we need to build the graphql module
     */
    GraphQLModule.forRootAsync({
      /**
       * this will inject the graphql module that is built from the
       * GraphQL Settings from accountsOptions
       */
      inject: [ACCOUNTS_JS_GRAPHQL],
      useFactory: (accountsGraphQL: typeof AccountsModule) => {
        /**
         * Here we return the nest js/apollo server options. One of which is
         * Graphql modules. All we have to do is add this module and we're off to the races
         */
        return {
          modules: [accountsGraphQL],
        };
      },
    }),
  ],
})
export class AppModule {}
