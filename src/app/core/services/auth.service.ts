import { lockUI } from 'src/app/core/helpers/ui.helpers';
import { Observable, from } from 'rxjs';
import { Router } from '@angular/router';
import { AppService } from 'src/app/app.service';
import { Injectable } from '@angular/core';
import {
  FacebookLoginProvider,
  GoogleLoginProvider,
  SocialAuthService,
} from 'angularx-social-login';

import {
  me,
  signin,
  signout,
  signup,
  signupSocial,
  updateme,
  checkUser,
  userData,
  generateOTP,
  generateMagicLink,
  generatePowerMagicLink,
  analizeMagicLink,
  signinSocial,
  simplifySignup,
  getTempCodeData,
} from '../graphql/auth.gql';
import { GraphQLWrapper } from '../graphql/graphql-wrapper.service';
import { Session } from '../models/session';
import { User } from '../models/user';
import { refresh, verifyUser, userExists } from './../graphql/auth.gql';
import { Logs } from 'selenium-webdriver';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  public session: Session;
  public ready: Observable<any>;

  constructor(
    private readonly graphql: GraphQLWrapper,
    private readonly social: SocialAuthService,
    private readonly app: AppService,
    private readonly router: Router
  ) {
    if (localStorage.getItem('session-token'))
      this.ready = from(this.refresh());
    else this.ready = from([undefined]);
  }

  public async userExist(emailOrPhone: string) {
    try {
      const result = await this.graphql.mutate({
        mutation: userExists,
        variables: { emailOrPhone },
      });
      return result?.exists as boolean;
    } catch (e) { }
    return false;
  }

  public async signin(
    emailOrPhone: string,
    password: string,
    remember: boolean
  ): Promise<Session> {
    try {
      const variables = { emailOrPhone, password, remember };
      const result = await this.graphql.mutate({ mutation: signin, variables });
      this.session = new Session(result?.session, true);
    } catch (e) {
      this.session?.revoke();
      this.session = undefined;
    }
    this.app.events.emit({ type: 'auth', data: this.session });
    return this.session;
  }

  public async refresh(): Promise<Session> {
    try {
      const promise = this.graphql.mutate({ mutation: refresh });
      lockUI(promise);
      const result = await promise;
      this.session = new Session(result?.session, true);
    } catch (e) {
      console.log(e);
      this.session?.revoke();
      this.session = undefined;
    }
    this.app.events.emit({ type: 'auth', data: this.session });
    return this.session;
  }

  public async signinSocial(
    input: any,
    authLogin: boolean = true
  ): Promise<Session> {
    try {
      input.createIfNotExist = true;
      const variables = { input };
      const result = await this.graphql.mutate({
        mutation: signinSocial,
        variables,
      });
      this.session = new Session(result?.signinSocial, true);
    } catch (e) {
      console.log(e);
      this.session?.revoke();
      this.session = undefined;
    }
    //this.app.events.emit({ type: 'auth', data: this.session });
    return this.session;
  }

  public async simplifySignup(
    emailOrPhone: string,
    notificationMethod: string
  ) {
    const result = await this.graphql.mutate({
      mutation: simplifySignup,
      variables: { emailOrPhone, notificationMethod },
    });
    return result;
  }

  public async getTempCodeData(token: string) {
    const result = await this.graphql.query({
      query: getTempCodeData,
      variables: { token: token },
    });
    return result;
  }

  public async signup(
    input: any,
    notificationMethod?: string,
    code?: string,
    assignPassword?: boolean,
    files?: any
  ): Promise<User> {
    const result = await this.graphql.mutate({
      mutation: signup,
      variables: { input, notificationMethod, code, assignPassword, files },
      context: {
        useMultipart: true,
      },
    });
    return result?.user ? new User(result?.user) : undefined;
  }

  public async verify(code: string, userId: string, use = true) {
    let session: Session;
    try {
      const variables = { code, userId };
      const mutation = verifyUser;
      const result = await this.graphql.mutate({ mutation, variables });
      session = new Session(result?.session, use);
      if (use) this.session = session;
    } catch (e) { }
    this.app.events.emit({ type: 'auth', data: this.session });
    return session;
  }

  public async signout(all = false): Promise<boolean> {
    try {
      const result = await this.graphql.mutate({ mutation: signout });
      if (result.success) {

        this.session?.revoke();
        this.session = undefined;
      }
      //this.app.events.emit({ type: 'auth', data: this.session });
      if (result.success) {
        this.router.navigateByUrl('/home');
        // this.app.nav = [];
        // this.app.header = {};
        window.location.reload();
      }
      return result.success;
    } catch (e) {
      return false;
    }
  }

  public async signouttwo(all = false): Promise<boolean> {
    try {
      const result = await this.graphql.mutate({ mutation: signout });
      if (result.success) {

        this.session?.revoke();
        this.session = undefined;
      }
      //this.app.events.emit({ type: 'auth', data: this.session });
      if (result.success) {
        // this.app.nav = [];
        // this.app.header = {};
        window.location.reload();
      }
      return result.success;
    } catch (e) {
      return false;
    }
  }

  // Signout without reload
  public async signoutThree(): Promise<boolean> {
    try {
      const result = await this.graphql.mutate({ mutation: signout });
      if (result.success) {

        this.session?.revoke();
        this.session = undefined;
        // this.app.nav = [];
        // this.app.header = {};
      }
      return result.success;
    } catch (e) {
      return false;
    }
  }

  public async socialAccess(social: 'google' | 'facebook'): Promise<Session> {
    const configs = {
      google: {
        id: GoogleLoginProvider.PROVIDER_ID,
        tokenKey: 'idToken',
      },
      facebook: {
        id: FacebookLoginProvider.PROVIDER_ID,
        tokenKey: '',
      },
    };
    const { id, tokenKey } = configs[social];
    const socialUser = await this.social.signIn(id);
    const token = socialUser[tokenKey];
    try {
      const variables = { token, social };
      const mutation = signupSocial;
      const result = await this.graphql.mutate({ mutation, variables });
      this.session = new Session(result?.session, true);
    } catch (e) {
      this.session?.revoke();
      this.session = undefined;
    }
    this.app.events.emit({ type: 'auth', data: this.session });
    return this.session;
  }

  // USER QUERIES
  public async me() {
    const response = await this.graphql.query({
      query: me,
      fetchPolicy: 'no-cache',
    });
    return response?.me ? new User(response?.me) : undefined;
  }

  public async user(_id) {
    try {
      const response = await this.graphql.query({
        query: userData,
        variables: { _id },
        fetchPolicy: 'no-cache',
      });
      return response;
    } catch (e) { }
  }

  public async updateMe(input: any, files?: any) {
    const response = await this.graphql.mutate({
      mutation: updateme,
      variables: { input, files },
      context: { useMultipart: true },
    });
    let user: User;
    if (response?.me) {
      user = new User(response?.me);
      if (this.session) this.session.user = user;
    }
    return user;
  }

  public async checkUser(emailOrPhone: String, notificationMethod?: String) {
    try {
      const response = await this.graphql.query({
        query: checkUser,
        variables: { emailOrPhone, notificationMethod },
        fetchPolicy: 'no-cache',
      });
      return response?.checkUser ? new User(response?.checkUser) : undefined;
    } catch (e) { }
  }

  public async generateOTP(emailOrPhone: String) {
    try {
      const response = await this.graphql.query({
        query: generateOTP,
        variables: { emailOrPhone },
        fetchPolicy: 'no-cache',
      });
      return response;
    } catch (e) { 
      console.log(e);
      return null;
    }
  }

  public async generateMagicLink(
    phoneNumber: string,
    redirectionRoute: string,
    redirectionRouteId: string,
    entity: string,
    redirectionRouteQueryParams: any,
    attachments?: any
  ) {
    try {
      const response = await this.graphql.mutate({
        mutation: generateMagicLink,
        variables: { 
          phoneNumber, 
          redirectionRoute, 
          redirectionRouteId, 
          entity, 
          redirectionRouteQueryParams,
          attachments
        },
        context: { useMultipart: true }
      });

      return response;
    } catch (err) {
      console.log(err);
    }
  }

  public async analizeMagicLink(tempcode: String) {
    try {
      const promise = this.graphql.query({
        query: analizeMagicLink,
        variables: { tempcode },
        fetchPolicy: 'no-cache',
      });

      this.ready = from(promise);

      const response = await promise;
      return response;
    } catch (e) { }
  }

  public async generatePowerMagicLink(hostPhoneNumber: string) {
    try {
      const response = await this.graphql.query({
        query: generatePowerMagicLink,
        variables: { hostPhoneNumber },
        fetchPolicy: 'no-cache',
      });
      return response;
    } catch (e) {
      console.log(e)
    }
  }
}