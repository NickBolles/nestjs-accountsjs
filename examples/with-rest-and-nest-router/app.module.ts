import { AccountsPassword } from '@accounts/password';
import { Module } from '@nestjs/common';
import { RouterModule } from 'nest-router';
import { ConfigModule } from 'nestjs-config';
import { resolve } from 'path';
import { AccountsJsModule } from '../../';
import { UserDatabase } from '../shared/database.service';
// tslint:disable:max-line-length

/**
 * Define the routes for the app
 */
const routes = [
  {
    path: '/app',
    children: [{ path: '/auth', module: AccountsJsModule }],
  },
];

@Module({
  imports: [
    /**
     * Mount the router module for the configured routes
     */
    RouterModule.forRoutes(routes),
    ConfigModule.load(resolve(__dirname, 'config', '**/!(*.d).{ts,js}')),
    AccountsJsModule.register({
      /**
       * This is just a POJO, but you can always use a provider, see the complex config example
       */

      serverOptions: {
        db: new UserDatabase(),
        tokenSecret: 'secret',
      },
      services: {
        password: new AccountsPassword(),
      },
      REST: {
        /**
         * With nest-router this path becomes relative to the route that is setup by nest router
         *
         * Internally nest-router sets the MODULE_PATH metadata on the module. This path will be
         * appended to the MODULE_PATH path, unless relative is set to false.
         *
         * If there is a MODULE_PATH, the default changes a bit, if there is no path passed in the MODULE_PATH is used
         * (/accounts is not appended like it is if there isn't a MODULE_PATH). if there is a path it's appended to the MODULE_PATH.
         *
         * If there is not a MODULE_PATH, or relative = false, it behaves the same as normal. The Path is absolute to the server's root
         *
         */
        path: '/myroute', // route examples: /auth/myroute/user, /auth/myroute/:service/authenticate, /auth/myroute/password/register etc.
        // path: "", // DEFAULT - route examples: /auth/user, /auth/:service/authenticate, /auth/password/register etc.
        // path: "/myroute", relative: false // examples: /myroute/user,  /myroute/:service/authenticate, /myroute/password/register etc.
        // relative: false // examples: /accounts/user,  /accounts/:service/authenticate, /accounts/password/register etc.
      },
    }),
  ],
})
export class AppModule {}
