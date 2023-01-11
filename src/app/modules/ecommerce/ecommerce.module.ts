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
import { ArticleDetailComponent } from './pages/article-detail/article-detail.component';
import { CreateArticleComponent } from './pages/create-article/create-article.component';
import { AdminModule } from '../admin/admin.module';
import { TextEditionAndPreviewComponent } from './pages/text-edition-and-preview/text-edition-and-preview.component';
import { ImageBannerComponent } from '../admin/pages/image-banner/image-banner.component';

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
    path: 'item-detail',
    component: ItemDetailComponent,
  },
  {
    path: 'order-info/:orderId',
    redirectTo: 'order-detail/:orderId',
    pathMatch: 'full',
  },
  {
    path: 'order-detail/:orderId',
    component: OrderDetailComponent,
  },
  {
    path: 'megaphone-v3/:merchantSlug',
    redirectTo: ':merchantSlug/store',
    pathMatch: 'full',
  },
  {
    path: 'store/:merchantSlug',
    redirectTo: ':merchantSlug/store',
    pathMatch: 'full',
  },
  {
    path: 'text-edition-and-preview',
    component: TextEditionAndPreviewComponent
  },
  {
    path: ':merchantSlug',
    component: EcommerceComponent,
    children: [
      {
        path: 'category-items/:categoryId',
        component: CategoryItemsComponent,
      },
      {
        path: 'provider-store/:itemId',
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
        path: 'store',
        component: StoreComponent,
      },
      {
        path: 'create-article',
        component: CreateArticleComponent,
      },
      {
        path: 'article-detail/:entity/:entityId',
        component: ArticleDetailComponent,
      },
      {
        path: 'new-address',
        component: NewAddressComponent,
      },
      {
        path: 'item-detail/:itemId',
        component: ItemDetailComponent,
      },
      {
        path: 'create-giftcard',
        component: CreateGiftcardComponent,
      },
      {
        path: 'reservations/:calendarId',
        component: ReservationsComponent,
      },
      {
        path: 'checkout',
        component: CheckoutComponent,
      },
      {
        path: 'payments/:orderId',
        component: PaymentsComponent,
      },
      {
        path: 'payments',
        component: PaymentsComponent,
      },
      {
        path: 'image-banner',
        component: ImageBannerComponent,
      }

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
    ArticleDetailComponent,
    CreateArticleComponent,
    TextEditionAndPreviewComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    AppointmentsModule,
    AdminModule,
    RouterModule.forChild(routes),
  ],
})
export class EcommerceModule {}
