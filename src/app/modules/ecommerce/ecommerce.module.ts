import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from './../../shared/shared.module';
import { CategoryItemsComponent } from './pages/category-items/category-items.component';
import { ProviderStoreComponent } from './pages/provider-store/provider-store.component';
import { CustomItemDetailComponent } from './pages/custom-item-detail/custom-item-detail.component';

const routes: Routes = [
  {
    path: 'category-items/:id/:categoryId',
    component: CategoryItemsComponent,
  },
  {
    path: 'provider-store',
    component: ProviderStoreComponent,
    children: [
      {
        path: 'quantity-and-quality',
        component: CustomItemDetailComponent,
      },
    ],
  },
];

@NgModule({
  declarations: [
    CategoryItemsComponent,
    ProviderStoreComponent,
    CategoryItemsComponent,
  ],
  imports: [CommonModule, SharedModule, RouterModule.forChild(routes)],
})
export class EcommerceModule {}
