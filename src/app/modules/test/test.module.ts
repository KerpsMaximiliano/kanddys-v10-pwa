import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { SharedModule } from 'src/app/shared/shared.module';
import { TestComponent } from './pages/test/test.component';
import { ReservationOrderlessComponent } from '../airtable/pages/reservations-orderless/reservations-orderless.component';
import { AirtableModule } from '../airtable/airtable.module';

const routes: Routes = [
  {
    path: 'test',
    component: TestComponent,
  },
];

@NgModule({
  declarations: [TestComponent],
  imports: [CommonModule, SharedModule, AirtableModule, RouterModule.forChild(routes)],
})
export class TestModule {}
