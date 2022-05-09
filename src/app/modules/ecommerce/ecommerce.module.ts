import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from './../../shared/shared.module';
import { CategoryItemsComponent } from './pages/category-items/category-items.component';
import { ProviderStoreComponent } from './pages/provider-store/provider-store.component';
import { CustomItemDetailComponent } from './pages/custom-item-detail/custom-item-detail.component';
import { ErrorScreenComponent } from './components/error-screen/error-screen.component';
import { MegaphoneV3Component } from './pages/megaphone-v3/megaphone-v3.component';
import { OrderInfoComponent } from './pages/order-info/order-info.component';
import { ShipmentDataFormComponent } from './pages/shipment-data-form/shipment-data-form.component';
import { ItemDetailComponent } from './pages/item-detail/item-detail.component';
import { FlowCompletionComponent } from './pages/flow-completion/flow-completion.component';
import { PrivacyPolicyComponent } from './pages/privacy-policy/privacy-policy.component';
import { CustomizerRedirectComponent } from 'src/app/shared/components/customizer-redirect/customizer-redirect.component';
import { UserInfoComponent } from './pages/user-info/user-info.component';
import { CreateGiftcardComponent } from './pages/create-giftcard/create-giftcard.component';
import { TestComponent } from './pages/test/test.component';
import { AdminOptionsComponent } from './pages/admin-options/admin-options.component';
import { SalesInfoComponent } from './pages/sales-info/sales-info.component';
import { PackageDetailComponent } from './pages/package-detail/package-detail.component';
import { ReservationComponent } from './pages/reservation/reservation.component';
import { MerchantDashboardComponent } from './pages/merchant-dashboard/merchant-dashboard.component';
import { MyItemsComponent } from './pages/my-items/my-items.component';
import { LandingComponent } from './pages/landing/landing.component';
import { OrderSalesComponent } from './pages/order-sales/order-sales.component';
import { TagDetailComponent } from './pages/tag-detail/tag-detail.component';
import { TagsEditComponent } from './pages/tags-edit/tags-edit.component';

const routes: Routes = [
  {
    path: '',
    component: LandingComponent,
  },
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
      {
        path: 'redirect-to-customizer',
        component: CustomizerRedirectComponent,
      },
      {
        path: 'user-info',
        component: UserInfoComponent,
      },
    ],
  },
  {
    path: 'error-screen',
    component: ErrorScreenComponent,
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
    component: ShipmentDataFormComponent,
  },
  {
    path: 'item-detail/:saleflow/:id',
    component: ItemDetailComponent,
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
  //added create-giftcard again because the merge was deleted??????
  {
    path: 'create-giftcard',
    component: CreateGiftcardComponent,
  },
  {
    path: 'test',
    component: TestComponent,
  },
  {
    path: 'admin-options',
    component: AdminOptionsComponent,
    children: [
      {
        path: 'sales-info',
        component: SalesInfoComponent,
      },
    ],
  },
  {
    path: 'package-detail/:id',
    component: PackageDetailComponent,
  },
  {
    path: 'reservations',
    component: ReservationComponent,
  },
  {
    path: 'merchant-dashboard',
    component: MerchantDashboardComponent,
  },
  {
    path: 'my-items',
    component: MyItemsComponent,
  },
  {
    path: 'order-sales/:id',
    component: OrderSalesComponent
  },
  {
      path: 'tag-detail',
      component: TagDetailComponent
  },
  {
      path: 'tags-edit',
      component: TagsEditComponent
  },
];

@NgModule({
  declarations: [
    CategoryItemsComponent,
    CustomItemDetailComponent,
    CustomizerRedirectComponent,
    ErrorScreenComponent,
    ProviderStoreComponent,
    CategoryItemsComponent,
    MegaphoneV3Component,
    OrderInfoComponent,
    ShipmentDataFormComponent,
    ItemDetailComponent,
    FlowCompletionComponent,
    PrivacyPolicyComponent,
    CustomizerRedirectComponent,
    UserInfoComponent,
    CreateGiftcardComponent,
    TestComponent,
    AdminOptionsComponent,
    SalesInfoComponent,
    PackageDetailComponent,
    ReservationComponent,
    MerchantDashboardComponent,
    MyItemsComponent,
    LandingComponent,
    OrderSalesComponent,
    TagDetailComponent,
    TagsEditComponent,
  ],
  imports: [CommonModule, SharedModule, RouterModule.forChild(routes)],
})
export class EcommerceModule {}
