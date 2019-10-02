import { AppAccountsOptionsFactory } from '../app.module';
import { RouteTestTableWithRelative } from '../../shared/routes';
import { sharedRoutesTests } from '../../shared/sharedRouteTests';
import { Module } from '@nestjs/common';
import { AccountsJsModule } from '../../../dist';
import { ConfigModule } from 'nestjs-config';
import { resolve } from 'path';

// It looks like nest-router can only be setup once, if we have multiple entries in
// imports it doesnt work, so lets setup a test module
@Module({
  imports: [
    ConfigModule.load(resolve(__dirname, 'config', '**/!(*.d).{ts,js}')), // mostly just for testing and injecting the path settings
    AccountsJsModule.registerAsync({ useClass: AppAccountsOptionsFactory }),
  ],
})
class AppModule {}

describe.skip('with-rest-and-nest-router', () => {
  describe('REST', () => sharedRoutesTests(AppModule, RouteTestTableWithRelative, { password: true }));
});
