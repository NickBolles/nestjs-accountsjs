import { configForPath, getRoutes, RequestRoute, GetRoutesOptions, RouteTestEntry } from './routes';
import { ConfigService } from 'nestjs-config';
import { INestApplication } from '@nestjs/common';
import { Test, TestingModuleBuilder } from '@nestjs/testing';
import { RouterModule } from 'nest-router';
import { AccountsJsModule } from '../../lib/accounts-js.module';
import { MODULE_PATH } from '@nestjs/common/constants';

interface PreCompileFixtureFn {
  (module: TestingModuleBuilder, path: string, expectedRootPath: string): Promise<void>;
}

export function sharedRoutesTests(AppModule: any, pathTables: RouteTestEntry[], routesOptions: GetRoutesOptions = {}) {
  describe.each(pathTables)(
    'mount routes for path %s IgnoreNestRoute: %p nestRoute: %s',
    (path, ignoreNestRoute, relativePath, expectedRootPath) => {
      let app: INestApplication;

      beforeAll(async () => {
        const imports = [];
        // If there's a relative route setup NestRouter
        if (relativePath)
          imports.push(RouterModule.forRoutes([{ module: AccountsJsModule, path: relativePath as any }]));

        const moduleFixture = await Test.createTestingModule({
          imports: [...imports, AppModule],
        })
          .overrideProvider(ConfigService)
          .useValue(configForPath(path as any, ignoreNestRoute as any))
          .compile();
        // const module = moduleFixture.get(AccountsJsModule);
        // console.log("=".repeat(50))
        // console.log("module path is: ",Reflect.getMetadata(MODULE_PATH, AccountsJsModule));

        app = moduleFixture.createNestApplication();
        await app.init();
      });

      it.each(getRoutes(expectedRootPath as any, routesOptions))(
        `should mount route: %s/%s (%s)`,
        async (rootPath, path, method) => {
          const res = await RequestRoute(app.getHttpServer(), path, method, expectedRootPath as any);

          expect(res.notFound).toBe(false);
        },
      );
    },
  );
}
