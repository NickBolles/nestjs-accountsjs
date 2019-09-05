import { AccountsPassword } from '@accounts/password';
import { Module, Inject } from '@nestjs/common';
import { ConfigModule } from 'nestjs-config';
import { resolve } from 'path';
// replace the below line with "import { AccountsJsModule } from '@nb/accountsjs-nest';"
import { AccountsJsModule, ACCOUNTS_JS_GRAPHQL, AccountsOptionsFactory, AsyncNestAccountsOptions } from '../../';
import { UserDatabase } from '../shared/database.service';
import { GraphQLModule, GqlOptionsFactory, GqlModuleOptions } from '@nestjs/graphql';
import { AccountsModule } from '@accounts/graphql-api';

class AppAccountsJSOptionsFactory implements AccountsOptionsFactory {
  constructor(@Inject(UserDatabase) private readonly userDatabase: UserDatabase) {}

  createAccountsOptions(): AsyncNestAccountsOptions {
    return {
      serverOptions: {
        db: this.userDatabase,
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
        withSchemaDefinition: true, // default: false
        userAsInterface: true, // default: false
        /**
         * For more on extending the user type see the accounts-js documentation
         * https://accounts-js.netlify.com/docs/transports/graphql#extending-user
         *
         */
      },
    };
  }
}

class AppGraphQLOptionsFactory implements GqlOptionsFactory {
  constructor(@Inject(ACCOUNTS_JS_GRAPHQL) private readonly accountsGQLModule: typeof AccountsModule) {}

  createGqlOptions(): GqlModuleOptions | Promise<GqlModuleOptions> {
    /**
     * Here we return the nest js/apollo server options. One of which is
     * Graphql modules. All we have to do is add this module and we're off to the races
     */
    return {
      modules: [this.accountsGQLModule],
    };
  }
}

@Module({
  providers: [UserDatabase],
  imports: [
    ConfigModule.load(resolve(__dirname, 'config', '**/!(*.d).{ts,js}')),
    AccountsJsModule.register({
      accountsOptions: { useClass: AppAccountsJSOptionsFactory },
    }),
    /**
     * Now we need to build the graphql module
     */
    GraphQLModule.forRootAsync({ useClass: AppGraphQLOptionsFactory }),
  ],
})
export class AppModule {}
