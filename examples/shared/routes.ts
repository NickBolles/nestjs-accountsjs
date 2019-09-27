import request from 'supertest';
import { join } from 'path';
import { ConfigService } from 'nestjs-config';

interface RouteDef {
  path: string;
  method: Method;
}

export interface GetRoutesOptions {
  password?: boolean;
  service?: string;
  oauth?: string[];
}

enum Method {
  GET = 'get',
  POST = 'post',
}

export function getRoutes(rootPath: string, options: GetRoutesOptions = {}): Array<[string, string, Method]> {
  return [
    [rootPath, 'user', Method.GET],
    [rootPath, 'impersonate', Method.POST],
    [rootPath, 'refreshTokens', Method.POST],
    [rootPath, 'logout', Method.POST],
    ...(options.service ? serviceRoutes(rootPath, options.service) : []),
    ...(options.password ? passwordRoutes(rootPath) : []),
    ...(options.oauth ? oauthRoutes(rootPath, options.oauth) : []),
  ];
}

export function serviceRoutes(rootPath: string, service: string): Array<[string, string, Method]> {
  return [
    [rootPath, `${service}/verifyAuthentication`, Method.POST],
    [rootPath, `${service}/authenticate`, Method.POST],
  ];
}

export function passwordRoutes(rootPath): Array<[string, string, Method]> {
  return [
    [rootPath, 'password/register', Method.POST],
    [rootPath, 'password/verifyEmail', Method.POST],
    [rootPath, 'password/resetPassword', Method.POST],
    [rootPath, 'password/sendVerificationEmail', Method.POST],
    [rootPath, 'password/sendResetPasswordEmail', Method.POST],
  ];
}

export function oauthRoutes(rootPath: string, providers: string[]): Array<[string, string, Method]> {
  if (!providers || !providers.length) {
    providers = [':provider'];
  }

  return providers.map(provider => [rootPath, `oauth/${provider}/callback`, Method.GET]);
}

/** Test Utils */

export const configForPath = (path: string, ignoreNestRoute: boolean = false) =>
  new ConfigService({ auth: { path, ignoreNestRoute } });

export type RouteTestEntry = [string, boolean, string, string];
const baseRouteList: RouteTestEntry[] = [
  [undefined, true, null, '/accounts'],
  ['/', true, null, '/'],
  ['myPath', true, null, '/myPath'],
  ['./myPath', true, null, '/myPath'], // uses resolve relative to / if nest route isn't set
  ['/myPath', true, null, '/myPath'],
  ['/myPath/', true, null, '/myPath'],
  ['//myPath//', true, null, '/myPath'], // normalizes slashes
  ['/myPath/another', true, null, '/myPath/another'],
];

export const RouteTestTableNoRelative: RouteTestEntry[] = [
  ...baseRouteList,
  ...(baseRouteList.map(([a, _, c, d]) => [a, false, c, d]) as RouteTestEntry[]), // false for ignore should be the same if there's no nest route
  // Setting a nest-router route shouldn't change anything if ignoreNestRoute is true
  ...(baseRouteList.map(([a, b, _, d]) => [a, b, '/auth', d]) as RouteTestEntry[]), // true for ignore should be the same even if there is a nest route
];

export const RouteTestTableWithRelative: RouteTestEntry[] = [
  // path, nest-router-path, expected root path
  ...RouteTestTableNoRelative,

  ...(baseRouteList.map(([a, b, _, d]) => [a, false, '', d]) as RouteTestEntry[]), // true for ignore should be the same even if there is a nest route

  // ['/', false, '', '/'],
  // ['/myPath', false, '', '/myPath'],
  // ['/myPath/', false, '', '/myPath'],
  // ['/myPath/another', false, '', '/myPath/another'],
  // [undefined, false, '', '/accounts'],
  // ['./myPath', false, '', '/myPath'],
  // Setting a nest-router route should be relative to the nest route
  ['/', false, '/auth', '/auth'],
  ['/myPath', false, '/auth', '/auth/myPath'],
  ['/myPath/', false, '/auth', '/auth/myPath'],
  ['/myPath/another', false, '/auth', '/auth/myPath/another'],
  [undefined, false, '/auth', '/auth'], // this one's a little different
  ['./myPath', false, '/auth', '/auth/myPath'],
];

export function RequestRoute(server: any, path: string, method: Method, prefix: string = '/'): request.Test {
  return request(server)[method](join(prefix, path));
}
