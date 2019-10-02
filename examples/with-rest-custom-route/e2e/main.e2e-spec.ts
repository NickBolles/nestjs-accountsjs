import { AppModule } from '../app.module';
import { RouteTestTableNoRelative, RouteTestTableWithRelative } from '../../shared/routes';
import { sharedRoutesTests } from '../../shared/sharedRouteTests';

describe('with-rest-custom-route', () => {
  describe('REST', () => sharedRoutesTests(AppModule, RouteTestTableWithRelative, { password: true }));
});
