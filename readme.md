

Full user management with Accounts.JS and Nest.js in minutes.


## Basic Usage

`npm i @nb/nestjs-accountsjs`

app.module.ts
```typescript
import { Module } from '@nestjs/common';
import { Mongo } from  '@accounts/mongo';
import { AccountsPassword } from '@accounts/password';
import { AccountsJsModule } from '@nb/nestjs-accountsjs';

@Module({
  imports: [
    AccountsJsModule.register({
      accountsOptions: {
        serverOptions: { // Options passed to the AccountsServer instance
          db: new Mongo(),
          tokenSecret: 'secret',
        },
        services: { // Services passed as the second parameter to the AccountsServer Instance
          password: new AccountsPassword(),
        },
        REST: true, // or an Object with any @accounts/rest options
        GraphQL: true // or an Object with any @accounts/graphql-api options
    }),
  ],
})
export class AppModule {}

```

Alternatively you can pass the accountsjs server that you want to use to regiser: 

```typescript
AccountsJsModule.register({useServer: accountsServerInstance})
```

### With a class

app.module.ts
```typescript
import { Module } from '@nestjs/common';
import { Mongo } from  '@accounts/mongo';
import { AccountsPassword } from '@accounts/password';
import { AccountsJsModule } from '@nb/nestjs-accountsjs';
import { AppAccountsOptionsFactory } from './AppAccountsOptionsFactory'

@Module({
  imports: [
    AccountsJsModule.register({ accountsOptions: { useClass: AppAccountsOptionsFactory } })
  ]
})
export class AppModule {}

```

AppAccountsOptionsFactory.ts
```typescript
class AppAccountsOptionsFactory implements AccountsOptionsFactory {
  constructor(@Inject(ConfigService) private readonly configService: ConfigService){}

  createAccountsOptions(): AsyncNestAccountsOptions {
    return {
        serverOptions: {
          db: new Mongo(),
          tokenSecret: this.configService.get('secret'),
        },
        services: {
          password: new AccountsPassword(),
        },
        REST: true, // or an Object with any @accounts/rest options
        GraphQL: true // or an Object with any @accounts/graphql-api options
    }
  }
}
```

### More Examples
See the examples directory for more examples

## Providers

The module will register several providers for accounts js. This enables these core items for dependency injection in Nest, which can be really powerful. For example you can inject the server into your user's service and add an event listener for user created, to populate the user with default data.

| Injector Token        | Value           | Type |
| ------------- |:-------------:|:-----:|
| ACCOUNTS_JS_SERVER | `AccountsServer` Instance  | `AccountsServer` |
| ACCOUNTS_JS_OPTIONS | Options for AccountsServer, AccountsServer services, REST and GraphQL | `NestAccountsOptions` |
| ACCOUNTS_JS_GRAPHQL | Accounts JS GraphQLModule |  AccountsModule from `@accounts/graphql-api`|


## Decorators

### Param Decorators
Decorators to match several of the request fields that accounts provides. These are compatible with both HTTP Request handlers and Graphql resolvers and helps to make code more concise and self-documenting

| Name        | Usage           |  Shorthand for |
| ------------- |:-------------:|:-----:|
| User      | `@User() currentUser: User` | `req.user` |
| UserId      | `@UserID() userId: string` | `req.user.id` |
| AuthToken | `@AuthToken() authToken: string | undefined` | multiple, `req.headers.Authorization`|
| ClientIP | `@ClientIP() clientIP: string` | multiple |
| UserAgent | `@UserAgent() userAgent: string` | multiple |

### Auth Guard

#### Auth Guard
2 more special decorators exist. The first is `@AuthGuard`. Auth guard, but default will check for the presence of a user on the Execution context. This can be used at either the class or the method handler level

```typescript
class MyController {
    @Get()
    @AuthGuard()
    mySecret() {
        return "I used to be a jedi"
    }
}
```

```typescript
@AuthGuard()
class MyController {
    @Get()
    mySecret() {
        return "I used to be a jedi"
    }
}
```
With GraphQL it's exactly the same
```typescript
@Resolver()
class MyResolver {
    @Query()
    @AuthGuard()
    mySecret() {
        return "I used to be a jedi"
    }
}
```

#### AuthValidator
The second is `@AuthValidator`, which can be used to customize the AuthGuard behavior. Validators are functions that return a boolean, or a promise that resolves to a boolean. If the result is truthy, the validator succeeds and if all validators succeed the method will be executed.

Validators can be added at the class or the method level, and will stack. So in the example below the `@AuthGuard` will run the class validator, `IsDarthVader`, then it will run `TimeToReveal` and `AsyncValidator`. If any of them fail, the method will not be run.

```typescript
import { 
    AuthGuard, 
    AuthValidator, 
    AccountsSessionRequest, 
    GQLParam } from "@nb/nestjs-accountsjs"
import { User } from "@accounts/types"

const IsDarthVader = (user: User, params: AccountsSessionRequest | GQLParam, context: ExecutionContext) => user.username = "Darth Vader"

const TimeToReveal = (user: User, params: AccountsSessionRequest, context: ExecutionContext) => params.body.IsItTime)

const AsyncValidator = (user: User) => Promise.resolve(true);

@AuthValidator(IsDarthVader)
class DarthVader {
    @Get()
    @AuthGuard()
    @AuthValidator([TimeToReveal, AsyncValidator])
    superSecret() {
        return "I am your father"
    }
}
```

#### Making Validators Robust
Note that TimeToReveal is HTTP specific because it uses the body to the request. We can make this a little more robust by using some of the util methods provided, such as `isGQLParam` `getGQLcontext`, `getFieldFromDecoratorParams` and `getFieldFormExecContext`.


```typescript
import { 
    AuthGuard, 
    AuthValidator, 
    AccountsSessionRequest, 
    GQLParam,
    isGQLParam,
    getGQLContext
} from "@nb/nestjs-accountsjs"
import { User } from "@accounts/types"

const IsDarthVader = (user: User) => user.username = "Darth Vader"

const TimeToReveal = (user: User, params: AccountsSessionRequest | GQLParam, context: ExecutionContext) => isGQLParam(params) ? getGQLContext(params).TimeToReveal : params.body.timeToReveal;

const AsyncValidator = () => Promise.resolve(true);

@Resolver()
@AuthGuard()
@AuthValidator(IsDarthVader)
class DarthVader {
    @Query()
    @AuthValidator([TimeToReveal, AsyncValidator])
    superSecret() {
        return "I am your father"
    }
}
```

### Other Decorators
`@EnableForService` - Guard to only enable if a service exists currently not fully implemented

## Interceptor

This module will mount The `AccountsSessionInterceptor` to initialize the session. This is registered as an `APP_INTERCEPTOR`, so it will be in effect for the entire app.
