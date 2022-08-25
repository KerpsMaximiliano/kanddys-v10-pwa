import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { SharedModule } from 'src/app/shared/shared.module';
// import { HeavenlyBalloonsComponent } from './pages/heavenly-balloons/heavenly-balloons.component';
// import { LlStudioOrderFormComponent } from './pages/ll-studio-order-form/ll-studio-order-form.component';
import { ReservationOrderlessComponent } from './pages/reservations-orderless/reservations-orderless.component';

const routes: Routes = [
  // {
  //   path: 'heavenly-balloons/:merchantId/:calendarId/:automationName',
  //   component: HeavenlyBalloonsComponent,
  // },
  // {
  //   path: 'll-studio-order-form/:merchantId/:calendarId/:automationName',
  //   component: LlStudioOrderFormComponent,
  // },
];

@NgModule({
  declarations: [
    // HeavenlyBalloonsComponent,
    // LlStudioOrderFormComponent,
    ReservationOrderlessComponent
  ],
  imports: [CommonModule, SharedModule, RouterModule.forChild(routes)],
})
export class AirtableModule { }
