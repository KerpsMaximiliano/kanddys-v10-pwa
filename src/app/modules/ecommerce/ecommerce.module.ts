import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from './../../shared/shared.module';
import { CategoryItemsComponent } from './pages/category-items/category-items.component';
import { ProviderStoreComponent } from './pages/provider-store/provider-store.component';
import { CustomItemDetailComponent } from './pages/custom-item-detail/custom-item-detail.component';
import { MegaphoneV3Component } from './pages/megaphone-v3/megaphone-v3.component';
import { OrderInfoComponent } from './pages/order-info/order-info.component';
import { ShipmentDataFormComponent } from './pages/shipment-data-form/shipment-data-form.component';
import { ItemDetailComponent } from './pages/item-detail/item-detail.component';
import { FlowCompletionComponent } from './pages/flow-completion/flow-completion.component';
import { PrivacyPolicyComponent } from './pages/privacy-policy/privacy-policy.component';

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
  {
    path: 'megaphone-v3/:id',
    component: MegaphoneV3Component,
  },
  {
    path: 'order-info/:id',
    component: OrderInfoComponent,
  },
  {
    path: 'shipment-data-form',
    component: ShipmentDataFormComponent
  },
  {
    path: 'item-detail/:saleflow/:id',
    component: ItemDetailComponent
  },
  {
    path: 'flow-completion',
    component: FlowCompletionComponent,
  },
  {
    path: 'flow-completion/:id',
    component: FlowCompletionComponent,
  },
  {
    path: 'privacy-policy',
    component: PrivacyPolicyComponent,
  },
];

@NgModule({
  declarations: [
    CategoryItemsComponent,
    ProviderStoreComponent,
    CategoryItemsComponent,
    MegaphoneV3Component,
    OrderInfoComponent,
    ShipmentDataFormComponent,
    ItemDetailComponent,
    FlowCompletionComponent,
    PrivacyPolicyComponent
  ],
  imports: [CommonModule, SharedModule, RouterModule.forChild(routes)],
})
export class EcommerceModule { }
