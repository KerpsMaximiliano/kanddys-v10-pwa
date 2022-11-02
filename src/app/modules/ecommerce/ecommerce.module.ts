import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from './../../shared/shared.module';
import { CategoryItemsComponent } from './pages/category-items/category-items.component';
import { CreateGiftcardComponent } from './pages/create-giftcard/create-giftcard.component';
import { HeavenlyBalloonsComponent } from './pages/heavenly-balloons/heavenly-balloons.component';
import { ItemDetailComponent } from './pages/item-detail/item-detail.component';
import { LlStudioOrderFormComponent } from './pages/ll-studio-order-form/ll-studio-order-form.component';
import { OrderDetailComponent } from './pages/order-detail/order-detail.component';
import { CustomItemDetailComponent } from './pages/provider-store/custom-item-detail/custom-item-detail.component';
import { CustomizerRedirectComponent } from './pages/provider-store/customizer-redirect/customizer-redirect.component';
import { ProviderStoreComponent } from './pages/provider-store/provider-store.component';
import { UserInfoComponent } from './pages/provider-store/user-info/user-info.component';
import { RedirectionsComponent } from './pages/redirections/redirections.component';
import { NewAddressComponent } from './pages/new-address/new-address.component';
import { EcommerceComponent } from './ecommerce/ecommerce.component';
import { CheckoutComponent } from './pages/checkout/checkout.component';
import { PaymentsComponent } from './pages/payments/payments.component';
import { StoreComponent } from './pages/store/store.component';
import { ReservationsComponent } from './pages/reservations/reservations.component';
import { AppointmentsModule } from '../appointments/appointments.module';

const routes: Routes = [
  {
    path: 'heavenly-balloons/:merchantId/:calendarId/:automationName',
    component: HeavenlyBalloonsComponent,
  },
  {
    path: 'll-studio-order-form/:merchantId/:calendarId/:automationName',
    component: LlStudioOrderFormComponent,
  },
  {
    path: 'redirections',
    component: RedirectionsComponent,
  },
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
        component: StoreComponent,
      },
      {
        path: ':saleflowId/new-address',
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
        path: ':saleflowId/create-giftcard',
        component: CreateGiftcardComponent,
      },
      {
        path: ':saleflowId/reservations/:calendarId',
        component: ReservationsComponent,
      },
      {
        path: 'order-detail/:orderId',
        component: OrderDetailComponent,
      },
      {
        path: ':saleflowId/checkout',
        component: CheckoutComponent,
      },
      {
        path: 'payments/:id',
        component: PaymentsComponent,
      },
    ],
  },
  {
    path: ':saleflowId/payments',
    component: PaymentsComponent,
  },
];

@NgModule({
  declarations: [
    EcommerceComponent,
    CategoryItemsComponent,
    CustomItemDetailComponent,
    CustomizerRedirectComponent,
    ProviderStoreComponent,
    StoreComponent,
    ItemDetailComponent,
    CustomizerRedirectComponent,
    UserInfoComponent,
    CreateGiftcardComponent,
    OrderDetailComponent,
    RedirectionsComponent,
    HeavenlyBalloonsComponent,
    LlStudioOrderFormComponent,
    NewAddressComponent,
    CheckoutComponent,
    PaymentsComponent,
    ReservationsComponent,
  ],
  imports: [
    CommonModule,
    SharedModule,
    AppointmentsModule,
    RouterModule.forChild(routes),
  ],
})
export class EcommerceModule {}
