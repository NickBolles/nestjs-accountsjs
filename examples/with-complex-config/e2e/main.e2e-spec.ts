import { AppModule } from '../app.module';
import { RouteTestTableNoRelative } from '../../shared/routes';
import { sharedRoutesTests } from '../../shared/sharedRouteTests';

describe('with-complex-config', () => {
  describe('REST', () => sharedRoutesTests(AppModule, RouteTestTableNoRelative, { password: true }));
});
