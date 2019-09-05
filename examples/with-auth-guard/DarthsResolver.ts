import { Resolver, Query } from '@nestjs/graphql';
import { AuthGuard, AccountsSessionRequest, AuthValidator } from '../../dist';
import { UseGuards, ExecutionContext } from '@nestjs/common';
import { User } from '@accounts/types';
import { GQLParam, isGQLParam, getGQLContext } from '../../dist/utils/GraphQLUtils';

const IsDarthVader = (user: User) => user.username === 'Darth Vader';
const TalkingToLuke = (_: User, params: AccountsSessionRequest | GQLParam) =>
  isGQLParam(params) ? !!(getGQLContext(params) as any).talkingToLuke : !!params.body.talkingToLuke;

@Resolver()
@UseGuards(AuthGuard)
@AuthValidator(IsDarthVader)
export class DarthsResolver {
  @Query()
  @UseGuards(AuthGuard)
  @AuthValidator(TalkingToLuke, () => true)
  darthsSecret() {
    return 'Luke, I am your father';
  }

  @Query()
  @UseGuards(AuthGuard)
  @AuthValidator(() => process.env.NODE_ENV === 'development') // Auth Validator can do anything, even if it's not user related
  devOnly() {
    return 'secret dev stuff';
  }
}
