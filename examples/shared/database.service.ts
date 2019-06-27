import {
  ConnectionInformations,
  CreateUser,
  DatabaseInterface,
  Session,
  User,
} from '@accounts/types';
import { Injectable } from '@nestjs/common';

@Injectable()
export class UserDatabase implements DatabaseInterface {
  // tslint:disable-next-line:variable-name
  private _users = [];

  findUserByEmail(email: string): Promise<User> {
    throw new Error('Method not implemented.');
  }
  findUserByUsername(userName: string): Promise<User> {
    throw new Error('Method not implemented.');
  }
  findUserById(userId: string): Promise<User> {
    throw new Error('Method not implemented.');
  }
  async createUser(user: CreateUser): Promise<string> {
    this._users.push(user);
    return 'User Created';
  }
  setUsername(userId: string, newUsername: string): Promise<void> {
    throw new Error('Method not implemented.');
  }
  findUserByServiceId(serviceName: string, serviceId: string): Promise<User> {
    throw new Error('Method not implemented.');
  }
  setService(userId: string, serviceName: string, data: object): Promise<void> {
    throw new Error('Method not implemented.');
  }
  unsetService(userId: string, serviceName: string): Promise<void> {
    throw new Error('Method not implemented.');
  }
  findPasswordHash(userId: string): Promise<string> {
    throw new Error('Method not implemented.');
  }
  findUserByResetPasswordToken(token: string): Promise<User> {
    throw new Error('Method not implemented.');
  }
  setPassword(userId: string, newPassword: string): Promise<void> {
    throw new Error('Method not implemented.');
  }
  addResetPasswordToken(
    userId: string,
    email: string,
    token: string,
    reason: string,
  ): Promise<void> {
    throw new Error('Method not implemented.');
  }
  setResetPassword(
    userId: string,
    email: string,
    newPassword: string,
    token: string,
  ): Promise<void> {
    throw new Error('Method not implemented.');
  }
  findUserByEmailVerificationToken(token: string): Promise<User> {
    throw new Error('Method not implemented.');
  }
  addEmail(userId: string, newEmail: string, verified: boolean): Promise<void> {
    throw new Error('Method not implemented.');
  }
  removeEmail(userId: string, email: string): Promise<void> {
    throw new Error('Method not implemented.');
  }
  verifyEmail(userId: string, email: string): Promise<void> {
    throw new Error('Method not implemented.');
  }
  addEmailVerificationToken(
    userId: string,
    email: string,
    token: string,
  ): Promise<void> {
    throw new Error('Method not implemented.');
  }
  setUserDeactivated(userId: string, deactivated: boolean): Promise<void> {
    throw new Error('Method not implemented.');
  }
  findSessionById(sessionId: string): Promise<Session> {
    throw new Error('Method not implemented.');
  }
  findSessionByToken(token: string): Promise<Session> {
    throw new Error('Method not implemented.');
  }
  createSession(
    userId: string,
    token: string,
    connection: ConnectionInformations,
    extraData?: object,
  ): Promise<string> {
    throw new Error('Method not implemented.');
  }
  updateSession(
    sessionId: string,
    connection: ConnectionInformations,
  ): Promise<void> {
    throw new Error('Method not implemented.');
  }
  invalidateSession(sessionId: string): Promise<void> {
    throw new Error('Method not implemented.');
  }
  invalidateAllSessions(userId: string): Promise<void> {
    throw new Error('Method not implemented.');
  }
}
