import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from './../../shared/shared.module';
import { CategoryItemsComponent } from './pages/category-items/category-items.component';
import { CreateGiftcardComponent } from './pages/create-giftcard/create-giftcard.component';
import { FlowCompletionAuthLessComponent } from './pages/flow-completion-auth-less/flow-completion-auth-less.component';
import { HeavenlyBalloonsComponent } from './pages/heavenly-balloons/heavenly-balloons.component';
import { ItemDetailComponent } from './pages/item-detail/item-detail.component';
import { LlStudioOrderFormComponent } from './pages/ll-studio-order-form/ll-studio-order-form.component';
import { MegaphoneV3Component } from './pages/megaphone-v3/megaphone-v3.component';
import { OrderDetailComponent } from './pages/order-detail/order-detail.component';
import { OrderInfoComponent } from './pages/order-info/order-info.component';
import { PackageDetailComponent } from './pages/package-detail/package-detail.component';
import { CustomItemDetailComponent } from './pages/provider-store/custom-item-detail/custom-item-detail.component';
import { CustomizerRedirectComponent } from './pages/provider-store/customizer-redirect/customizer-redirect.component';
import { ProviderStoreComponent } from './pages/provider-store/provider-store.component';
import { UserInfoComponent } from './pages/provider-store/user-info/user-info.component';
import { RedirectionsComponent } from './pages/redirections/redirections.component';
import { ReservationComponent } from './pages/reservation/reservation.component';
import { ShipmentDataFormComponent } from './pages/shipment-data-form/shipment-data-form.component';
import { NewAddressComponent } from './pages/new-address/new-address.component';
import { EcommerceComponent } from './ecommerce/ecommerce.component';
import { CheckoutComponent } from './pages/checkout/checkout.component';
import { PaymentsComponent } from './pages/payments/payments.component';

const routes: Routes = [
  {
    path: '',
    component: EcommerceComponent,
    children: [
      {
        path: 'category-items/:id/:categoryId',
        component: CategoryItemsComponent,
      },
      {
        path: 'provider-store/:saleflowId/:itemId',
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
      { path: 'megaphone-v3/:id', redirectTo: 'store/:id', pathMatch: 'full' },
      {
        path: 'store/:id',
        component: MegaphoneV3Component,
      },
      {
        path: 'order-info/:id',
        component: OrderDetailComponent,
      },
      {
        path: 'shipment-data-form',
        component: ShipmentDataFormComponent,
      },
      {
        path: 'new-address',
        component: NewAddressComponent,
      },
      {
        path: 'item-detail',
        component: ItemDetailComponent,
      },
      {
        path: 'item-detail/:saleflow/:id',
        component: ItemDetailComponent,
      },
      {
        path: 'flow-completion-auth-less',
        component: FlowCompletionAuthLessComponent,
      },
      {
        path: 'flow-completion-auth-less/:orderId',
        component: FlowCompletionAuthLessComponent,
      },

      {
        path: 'create-giftcard',
        component: CreateGiftcardComponent,
      },

      {
        path: 'package-detail/:saleflowId/:packageId',
        component: PackageDetailComponent,
      },
      {
        path: 'reservations',
        component: ReservationComponent,
      },

      {
        path: 'order-detail/:id',
        component: OrderDetailComponent,
      },
      {
        path: 'redirections',
        component: RedirectionsComponent,
      },
      {
        path: 'heavenly-balloons/:merchantId/:calendarId/:automationName',
        component: HeavenlyBalloonsComponent,
      },
      {
        path: 'll-studio-order-form/:merchantId/:calendarId/:automationName',
        component: LlStudioOrderFormComponent,
      },
      {
        path: 'checkout',
        component: CheckoutComponent,
      },
      {
        path: 'payments/:id',
        component: PaymentsComponent,
      },
    ],
  },
];

@NgModule({
  declarations: [
    EcommerceComponent,
    CategoryItemsComponent,
    CustomItemDetailComponent,
    CustomizerRedirectComponent,
    ProviderStoreComponent,
    MegaphoneV3Component,
    OrderInfoComponent,
    ShipmentDataFormComponent,
    ItemDetailComponent,
    FlowCompletionAuthLessComponent,
    CustomizerRedirectComponent,
    UserInfoComponent,
    CreateGiftcardComponent,
    PackageDetailComponent,
    ReservationComponent,
    OrderDetailComponent,
    RedirectionsComponent,
    HeavenlyBalloonsComponent,
    LlStudioOrderFormComponent,
    NewAddressComponent,
    CheckoutComponent,
    PaymentsComponent,
  ],
  imports: [CommonModule, SharedModule, RouterModule.forChild(routes)],
})
export class EcommerceModule {}
