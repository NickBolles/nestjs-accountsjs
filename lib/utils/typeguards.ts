import { Provider } from '@nestjs/common';
import { Type } from '@nestjs/common/interfaces';

export function isProvider<T = any>(obj: any): obj is Provider<T> {
  // test if the object is a class too, if it's a POJO that doesn't have the other fields, it shouldn't pass this
  return (obj && 'useClass' in obj) || 'useValue' in obj || 'useFactory' in obj || isClass(obj);
}

export function isClass<T = any>(obj: any): obj is Type<T> {
  return obj && obj.constructor !== Object;
}
