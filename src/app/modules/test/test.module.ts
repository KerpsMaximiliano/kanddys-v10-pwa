import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { SharedModule } from 'src/app/shared/shared.module';
import { TestComponent } from './pages/test/test.component';
import { ReservationOrderlessComponent } from '../airtable/pages/reservations-orderless/reservations-orderless.component';
import { AirtableModule } from '../airtable/airtable.module';
import { TagItemsComponent } from 'src/app/shared/components/tag-items/tag-items.component';

const routes: Routes = [
  {
    path: 'test',
    component: TestComponent,
  },
  {
    path: 'tag-items/:tagId',
    component: TagItemsComponent,
  },
];

@NgModule({
  declarations: [TestComponent],
  imports: [CommonModule, SharedModule, AirtableModule, RouterModule.forChild(routes)],
})
export class TestModule {}
