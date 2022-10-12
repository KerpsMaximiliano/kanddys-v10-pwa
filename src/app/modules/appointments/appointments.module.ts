import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { ReservationsCreatorComponent } from './pages/reservations-creator/reservations-creator.component';
import { SharedModule } from 'src/app/shared/shared.module';

const routes: Routes = [
  {
    path: 'reservations-creator/:calendarId',
    component: ReservationsCreatorComponent,
  },
  {
    path: 'reservations-creator/:calendarId/:reservationId',
    component: ReservationsCreatorComponent,
  },
];

@NgModule({
  declarations: [ReservationsCreatorComponent],
  exports: [ReservationsCreatorComponent],
  imports: [CommonModule, SharedModule, RouterModule.forChild(routes)],
})
export class AppointmentsModule {}
