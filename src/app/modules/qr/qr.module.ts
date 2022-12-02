import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { QrComponent } from './qr/qr.component';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: ':qrId',
    component: QrComponent,
  },
];

@NgModule({
  declarations: [QrComponent],
  imports: [CommonModule, RouterModule.forChild(routes)],
})
export class QrModule {}
