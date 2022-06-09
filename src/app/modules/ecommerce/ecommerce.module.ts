import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from './../../shared/shared.module';
import { CategoryItemsComponent } from './pages/category-items/category-items.component';
import { ProviderStoreComponent } from './pages/provider-store/provider-store.component';
import { CustomItemDetailComponent } from './pages/provider-store/custom-item-detail/custom-item-detail.component';
import { ErrorScreenComponent } from './components/error-screen/error-screen.component';
import { MegaphoneV3Component } from './pages/megaphone-v3/megaphone-v3.component';
import { OrderInfoComponent } from './pages/order-info/order-info.component';
import { ShipmentDataFormComponent } from './pages/shipment-data-form/shipment-data-form.component';
import { ItemDetailComponent } from './pages/item-detail/item-detail.component';
import { FlowCompletionComponent } from './pages/flow-completion/flow-completion.component';
import { FlowCompletionAuthLessComponent } from './pages/flow-completion-auth-less/flow-completion-auth-less.component';
import { PrivacyPolicyComponent } from './pages/privacy-policy/privacy-policy.component';
import { CustomizerRedirectComponent } from './pages/provider-store/customizer-redirect/customizer-redirect.component';
import { UserInfoComponent } from './pages/provider-store/user-info/user-info.component';
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
import { RedirectionsComponent } from './pages/redirections/redirections.component';
import { TagDetailComponent } from './pages/tag-detail/tag-detail.component';
import { TagsEditComponent } from './pages/tags-edit/tags-edit.component';
import { AuthClassicComponent } from './pages/auth-classic/auth-classic.component';
import { PaymentsComponent } from './pages/payments/payments.component';
import { DataListComponent } from './pages/data-list/data-list.component';
import { MerchantDashboardv2Component } from './pages/merchant-dashboardv2/merchant-dashboardv2.component';
import { ContainerFormComponent } from './pages/container-form/container-form.component';
import { PostCreatorComponent } from './pages/post-creator/post-creator.component';
import { PostPreviewComponent } from './pages/post-preview/post-preview.component';
import { PostEditComponent } from './pages/post-edit/post-edit.component';
import { DeliveryPreviewComponent } from './pages/delivery-preview/delivery-preview.component';
import { PostAuthComponent } from './pages/post-auth/post-auth.component';
import { MerchantCreatorComponent } from './pages/merchant-creator/merchant-creator.component';
import { ItemCreatorComponent } from './pages/item-creator/item-creator.component';
import { UserDashboardComponent } from './pages/user-dashboard/user-dashboard.component';
import { ItemGalleryComponent } from './pages/item-gallery/item-gallery.component';
import { UserOrdersComponent } from './pages/user-dashboard/user-orders/user-orders.component';
import { NewItemDisplayComponent } from './pages/new-item-display/new-item-display.component';
import { BankRegistrationComponent } from './pages/bank-registration/bank-registration.component';
import { NewItemContactInfoComponent } from './pages/new-item-contact-info/new-item-contact-info.component';
import { LlStudioOrderFormComponent } from './pages/ll-studio-order-form/ll-studio-order-form.component';
import { MyStoreComponent } from './pages/my-store/my-store.component';
import { MallDashboardComponent } from './pages/mall-dashboard/mall-dashboard.component';
import { MallGiftsComponent } from './pages/mall-dashboard/mall-gifts/mall-gifts.component';
import { MallStoresComponent } from './pages/mall-dashboard/mall-stores/mall-stores.component';

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
    path: 'flow-completion/:orderId',
    component: FlowCompletionComponent,
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
    path: 'auth-classic',
    component: AuthClassicComponent,
  },
  {
    path: 'payments',
    component: PaymentsComponent,
  },
  {
    path: 'payments/:id',
    component: PaymentsComponent,
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
    path: 'package-detail/:saleflowId/:packageId',
    component: PackageDetailComponent,
  },
  {
    path: 'reservations',
    component: ReservationComponent,
  },
  {
    path: 'merchant-dashboard/:merchantId',
    component: MerchantDashboardComponent,
    children:[
        {
           path: 'my-store',
           component: MyStoreComponent,
        },
    ],
  },
  {
    path: 'my-items',
    component: MyItemsComponent,
  },
  {
    path: 'order-sales/:id',
    component: OrderSalesComponent,
  },
  {
    path: 'redirections',
    component: RedirectionsComponent,
  },
  {
    path: 'tag-detail',
    component: TagDetailComponent,
  },
  {
    path: 'tags-edit',
    component: TagsEditComponent,
  },
  {
    path: 'data-list/:orderId',
    component: DataListComponent,
  },
  {
    path: 'merchant-dashboardv2',
    component: MerchantDashboardv2Component,
  },
  {
    path: 'container-form/:merchantId/:tagId',
    component: ContainerFormComponent,
  },
  {
    path: 'post-creator',
    component: PostCreatorComponent,
  },
  {
    path: 'post-preview',
    component: PostPreviewComponent,
  },
  {
    path: 'post-edit',
    component: PostEditComponent,
  },
  {
    path: 'post-edit/:postId',
    component: PostEditComponent,
  },
  {
    path: 'delivery-preview',
    component: DeliveryPreviewComponent,
  },
  {
    path: 'post-auth',
    component: PostAuthComponent,
  },
  {
    path: 'merchant-creator',
    component: MerchantCreatorComponent,
  },
  {
    path: 'item-creator',
    component: ItemCreatorComponent,
  },
  {
    path: 'item-creator/:itemId',
    component: ItemCreatorComponent,
  },
  {
    path: 'user-dashboard',
    component: UserDashboardComponent,
    children: [
      {
        path: 'tiendas',
        component: UserOrdersComponent,
      },
    ],
  },
  {
    path: 'mall-dashboard',
    component: MallDashboardComponent,
    children: [
      {
        path: 'gifts',
        component: MallGiftsComponent,
      },
      {
        path: 'stores',
        component: MallStoresComponent,
      },
    ],
  },
  {
    path: 'item-gallery',
    component: ItemGalleryComponent
  },
  {
    path: 'item-display/:itemId',
    component: NewItemDisplayComponent
  },
  {
    path: 'bank-registration',
    component: BankRegistrationComponent
  },
  {
    path: 'new-item-contact-info',
    component: NewItemContactInfoComponent
  },
  {
    path: 'll-studio-order-form',
    component: LlStudioOrderFormComponent
  }
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
    FlowCompletionAuthLessComponent,
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
    RedirectionsComponent,
    TagDetailComponent,
    TagsEditComponent,
    AuthClassicComponent,
    PaymentsComponent,
    DataListComponent,
    MerchantDashboardv2Component,
    ContainerFormComponent,
    PostCreatorComponent,
    PostPreviewComponent,
    PostEditComponent,
    DeliveryPreviewComponent,
    PostAuthComponent,
    MerchantCreatorComponent,
    ItemCreatorComponent,
    UserDashboardComponent,
    UserOrdersComponent,
    ItemGalleryComponent,
    NewItemDisplayComponent,
    BankRegistrationComponent,
    NewItemContactInfoComponent,
    LlStudioOrderFormComponent,
    MyStoreComponent,
    MallDashboardComponent,
    MallGiftsComponent,
    MallStoresComponent,
  ],
  imports: [CommonModule, SharedModule, RouterModule.forChild(routes)],
})
export class EcommerceModule { }
