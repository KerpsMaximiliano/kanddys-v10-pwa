import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { QrComponent } from './qr/qr.component';
import { RouterModule, Routes } from '@angular/router';
import { ArticleDetailComponent } from '../ecommerce/pages/article-detail/article-detail.component';
import { PostsXlsComponent } from 'src/app/shared/components/posts-xls/posts-xls.component';
import { ArticleTemplateComponent } from '../ecommerce/pages/article-template/article-template.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { SymbolDetailComponent } from '../ecommerce/pages/symbol-detail/symbol-detail.component';

const routes: Routes = [
  {
    path: 'posts-xls',
    component: PostsXlsComponent,
  },
  {
    path: ':qrId',
    component: QrComponent,
  },
  {
    path: 'article-detail/:entity/:entityId',
    component: SymbolDetailComponent,
  },
  {
    path: 'article-template/:entityTemplateId',
    component: ArticleTemplateComponent,
  },
];

@NgModule({
  declarations: [QrComponent, ArticleTemplateComponent],
  imports: [CommonModule, SharedModule, RouterModule.forChild(routes)],
})
export class QrModule {}
