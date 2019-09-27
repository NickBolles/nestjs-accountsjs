import { AppModule } from '../app.module';
import { sharedRoutesTests } from '../../shared/sharedRouteTests';
import { RouteTestTableNoRelative } from '../../shared/routes';

describe('with-complex-class-config', () => {
  describe('REST', () => sharedRoutesTests(AppModule, RouteTestTableNoRelative, { password: true }));
});
