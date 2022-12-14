import {
  APP_INITIALIZER,
  CUSTOM_ELEMENTS_SCHEMA,
  NgModule,
} from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { ServiceWorkerModule } from '@angular/service-worker';
import { ToastrModule } from 'ngx-toastr';
import { AppService } from './app.service';

import { DecimalPipe } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { environment } from '../environments/environment';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { GraphQLModule } from './graphql.module';
import { SharedModule } from './shared/shared.module';
import { NgxImageCompressService } from 'ngx-image-compress';

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    // SocialLoginModule,
    AppRoutingModule,
    ServiceWorkerModule.register('service-worker.js', {
      enabled: environment.production,
    }),
    SharedModule,
    GraphQLModule,
    HttpClientModule,
    BrowserAnimationsModule,
    ToastrModule.forRoot({
      positionClass: 'toast-bottom-center',
      preventDuplicates: true,
    }),
  ],
  providers: [
    AppService,
    {
      multi: true,
      deps: [AppService],
      provide: APP_INITIALIZER,
      useFactory: (appService: AppService) => () => appService.ngOnAppInit(),
    },
    DecimalPipe,
    NgxImageCompressService,
  ],
  bootstrap: [AppComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class AppModule {}
