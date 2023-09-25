/// <reference types="@types/gapi.auth2" />
import { Injectable, NgZone } from '@angular/core';
import { Router } from '@angular/router';
import { promise } from 'protractor';
import { Observable, ReplaySubject } from 'rxjs';
import { AppService } from 'src/app/app.service';
import { AuthService } from './auth.service';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class GoogleSigninService {
  private auth2: gapi.auth2.GoogleAuth;
  private subject = new ReplaySubject<gapi.auth2.GoogleUser>(1);
  constructor(
    private readonly router: Router,
    private zone: NgZone,
    private auth: AuthService,
    private readonly app: AppService,
  ) {
    gapi.load('auth2', () => {
      this.auth2 = gapi.auth2.init({
        client_id:
        `${environment.socials.googleId}`,
        scope: 'email',
      });
      console.log(this.auth2);
    });
  }

  public async signIn(authLogin: boolean = true) {
    console.log('I am passing signIn');

    var auth2 = gapi.auth2.getAuthInstance();
    console.log(auth2.currentUser.get().getAuthResponse());         
      // Sign the user in, and then retrieve their ID.
      await auth2.signIn().then(() => {
        console.log(auth2.currentUser.get().getAuthResponse().id_token);
        this.auth.signinSocial({
          token: auth2.currentUser.get().getAuthResponse().id_token,
          social: 'google',
          remember: false
        },
        authLogin
        ).then(data => {
          console.log(data);
          if (authLogin) {
            this.app.events.emit({ type: 'auth', data: data });
          }else{
            this.zone.run(() =>{
              this.app.events.emit({ type: 'singleAuth', data: data });
            })
          }
        })
        return auth2.currentUser.get().getBasicProfile();
      });
    return;         
 }

  public signout() {
    this.auth2.signOut().then(() => {});
  }

  public observable(): Observable<gapi.auth2.GoogleUser> {
    return this.subject.asObservable();
  }

  navigate() {
    this.zone.run(() => {
      this.router.navigate(['affiliate-data-entry']);
    });
  }
}
