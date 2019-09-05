import { Injectable, Inject } from '@nestjs/common';
import { ACCOUNTS_JS_SERVER } from '../../'; // Replace with @nb/nestjs-accountsjs
import { AccountsServer, ServerHooks } from '@accounts/server';
import { User } from '@accounts/types';

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

/* eslint-disable require-await */
@Injectable()
export class UserService {
  constructor(@Inject(ACCOUNTS_JS_SERVER) private readonly accounts: AccountsServer) {
    this.initHooks();
  }

  private initHooks() {
    this.accounts.on(ServerHooks.CreateUserSuccess, (...args) => this.onCreateUser(...args));
  }

  private async onCreateUser(user: User) {
    console.log('User Created');
    // Here we can do anything we want to do on user creation, such as default a profile in
    await this.updateUser(user.id, { profile: { avatar: '' } });
  }

  public updateUser(id, data) {
    return true;
  }
}
