import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { QrComponent } from './qr/qr.component';
import { RouterModule, Routes } from '@angular/router';
import { ArticleDetailComponent } from '../ecommerce/pages/article-detail/article-detail.component';

const routes: Routes = [
  {
    path: ':qrId',
    component: QrComponent,
  },
  {
    path: 'article-detail/:entity/:entityId',
    component: ArticleDetailComponent,
  },
];

@NgModule({
  declarations: [QrComponent],
  imports: [CommonModule, RouterModule.forChild(routes)],
})
export class QrModule {}
