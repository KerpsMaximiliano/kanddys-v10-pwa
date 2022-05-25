import { AppService } from './app.service';
import {
  CUSTOM_ELEMENTS_SCHEMA,
  NgModule,
  APP_INITIALIZER,
} from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { ServiceWorkerModule } from '@angular/service-worker';
import { OnsenModule } from 'ngx-onsenui';

import { environment } from '../environments/environment';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { SharedModule } from './shared/shared.module';
import { GraphQLModule } from './graphql.module';
import { HttpClientModule } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { SocialLoginModule } from 'angularx-social-login';
import { DecimalPipe } from '@angular/common';

@NgModule({
  declarations: [AppComponent],
  imports: [
    OnsenModule,
    BrowserModule,
    BrowserAnimationsModule,
    SocialLoginModule,
    AppRoutingModule,
    ServiceWorkerModule.register('service-worker.js', {
      enabled: environment.production,
    }),
    SharedModule,
    GraphQLModule,
    HttpClientModule,
  ],
  providers: [
    AppService,
    {
      multi: true,
      deps: [AppService],
      provide: APP_INITIALIZER,
      useFactory: (appService: AppService) => () => appService.ngOnAppInit(),
    },
    DecimalPipe
  ],
  bootstrap: [AppComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class AppModule {}
