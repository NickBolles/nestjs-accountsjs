import { Resolver, Query } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { AuthGuard } from '../../';

@Resolver()
export class UserResolver {
  @Query()
  public() {
    return 'beep boop';
  }

  @Query()
  @UseGuards(AuthGuard)
  mySecret() {
    return 'I used to be a jedi';
  }
}
