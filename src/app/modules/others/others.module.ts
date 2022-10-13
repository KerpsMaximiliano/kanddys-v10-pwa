import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { SharedModule } from 'src/app/shared/shared.module';
import { LandingComponent } from './pages/landing/landing.component';
import { ContainerFormComponent } from './pages/container-form/container-form.component';
import { DataListComponent } from './pages/data-list/data-list.component';
import { DeliveryPreviewComponent } from './pages/delivery-preview/delivery-preview.component';
import { ErrorScreenComponent } from './pages/error-screen/error-screen.component';
import { PostAuthComponent } from './pages/post-auth/post-auth.component';
import { PostCreatorComponent } from './pages/post-creator/post-creator.component';
import { PostEditComponent } from './pages/post-edit/post-edit.component';
import { PostPreviewComponent } from './pages/post-preview/post-preview.component';
import { PrivacyPolicyComponent } from './pages/privacy-policy/privacy-policy.component';
import { UserContactLandingComponent } from './pages/user-contact-landing/user-contact-landing.component';
import { UserDashboardComponent } from './pages/user-dashboard/user-dashboard.component';
import { UserOrdersComponent } from './pages/user-dashboard/user-orders/user-orders.component';
import { MallDashboardComponent } from './pages/mall-dashboard/mall-dashboard.component';
import { MallGiftsComponent } from './pages/mall-dashboard/mall-gifts/mall-gifts.component';
import { MallStoresComponent } from './pages/mall-dashboard/mall-stores/mall-stores.component';
import { AdminLoginComponent } from './pages/admin-login/admin-login.component';
import { AdminOrderComponent } from './pages/admin-order/admin-order.component';
import { BankRegistrationComponent } from './pages/bank-registration/bank-registration.component';
import { CalendarCreatorComponent } from './pages/calendar-creator/calendar-creator.component';
import { CalendarDetailComponent } from './pages/calendar-detail/calendar-detail.component';
import { CategoryItemDetailComponent } from './pages/category-item-detail/category-item-detail.component';
import { CategoryItemsAdminComponent } from './pages/category-items-admin/category-items-admin.component';
import { TagCategoryCreatorComponent } from './pages/item-category-creator/item-category-creator.component';
import { ItemCategoryExpositionComponent } from './pages/item-category-exposition/item-category-exposition.component';
import { ItemSalesDetailComponent } from './pages/item-sales-detail/item-sales-detail.component';
import { MerchantBuyersComponent } from './pages/merchant-buyers/merchant-buyers.component';
import { MerchantOrdersComponent } from './pages/merchant-orders/merchant-orders.component';
import { MerchantSharedComponent } from './pages/merchant-shared/merchant-shared.component';
import { MetricsInfoComponent } from './pages/metrics-info/metrics-info.component';
import { NotificationCreatorComponent } from './pages/notification-creator/notification-creator.component';
import { NotificationsLogComponent } from './pages/notifications-log/notifications-log.component';
import { OrderReservationComponent } from './pages/order-reservation/order-reservation.component';
import { ReservationDetailComponent } from './pages/reservation-detail/reservation-detail.component';
import { ReservationsComponent } from './pages/reservations/reservations.component';
import { SaleDetailComponent } from './pages/sale-detail/sale-detail.component';
import { TagDetailComponent } from './pages/tag-detail/tag-detail.component';
import { TagsEditComponent } from './pages/tags-edit/tags-edit.component';
import { TimeBlockComponent } from 'src/app/shared/components/time-block/time-block.component';

const routes: Routes = [
  {
    path: '',
    component: LandingComponent,
  },
  {
    path: 'container-form/:merchantId/:tagId',
    component: ContainerFormComponent,
  },
  {
    path: 'data-list/:id',
    component: DataListComponent,
  },
  {
    path: 'data-list',
    component: DataListComponent,
  },
  {
    path: 'delivery-preview',
    component: DeliveryPreviewComponent,
  },
  {
    path: 'error-screen',
    component: ErrorScreenComponent,
  },
  {
    path: 'post-auth',
    component: PostAuthComponent,
  },
  {
    path: 'post-creator',
    component: PostCreatorComponent,
  },
  {
    path: 'post-edit/:postId',
    component: PostEditComponent,
  },
  {
    path: 'post-edit',
    component: PostEditComponent,
  },
  {
    path: 'post-preview',
    component: PostPreviewComponent,
  },
  {
    path: 'privacy-policy',
    component: PrivacyPolicyComponent,
  },
  {
    path: 'user-contact-landing/:id',
    component: UserContactLandingComponent,
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
  // FROM ADMIN 21/9/2022
  {
    path: 'admin-login',
    component: AdminLoginComponent,
  },
  {
    path: 'bank-registration/:saleflowId',
    component: BankRegistrationComponent,
  },
  {
    path: 'calendar-creator',
    component: CalendarCreatorComponent,
  },
  {
    path: 'calendar-creator/:calendarId',
    component: CalendarCreatorComponent,
  },
  {
    path: 'calendar-detail',
    component: CalendarDetailComponent,
  },
  {
    path: 'category-item-detail/:itemId',
    component: CategoryItemDetailComponent,
  },
  {
    path: 'category-items-admin/:categoryId',
    component: CategoryItemsAdminComponent,
  },
  {
    path: 'category-creator/:id',
    component: TagCategoryCreatorComponent,
  },
  {
    path: 'category-creator',
    component: TagCategoryCreatorComponent,
  },
  {
    path: 'tag-creator/:id',
    component: TagCategoryCreatorComponent,
  },
  {
    path: 'tag-creator',
    component: TagCategoryCreatorComponent,
  },
  {
    path: 'item-category-exposition',
    component: ItemCategoryExpositionComponent,
  },
  {
    path: 'item-sales-detail/:itemId',
    component: ItemSalesDetailComponent,
  },
  {
    path: 'merchant-buyers',
    component: MerchantBuyersComponent,
  },
  {
    path: 'merchant-orders',
    component: MerchantOrdersComponent,
  },
  {
    path: 'notification-creator/:id/:notificationId',
    component: NotificationCreatorComponent,
  },
  {
    path: 'notification-creator/:id',
    component: NotificationCreatorComponent,
  },
  {
    path: 'notifications-log/:id',
    component: NotificationsLogComponent,
  },
  {
    path: 'notifications-log',
    component: NotificationsLogComponent,
  },
  {
    path: 'reservation/:reservationId',
    component: ReservationDetailComponent,
  },
  {
    path: 'item-reservations/:id',
    component: ReservationsComponent,
  },
  {
    path: 'item-reservations',
    component: ReservationsComponent,
  },
  {
    path: 'sale-detail/:orderId',
    component: SaleDetailComponent,
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
    path: 'order-reservation',
    component: OrderReservationComponent,
  },
  {
    path: 'admin-order',
    component: AdminOrderComponent,
  },
  {
    path: 'metrics-info',
    component: MetricsInfoComponent,
  },
  {
    path: 'merchant-shared/:merchantId',
    component: MerchantSharedComponent,
  },
  {
    path: 'time-block/:calendarId',
    component: TimeBlockComponent,
  },
  // FROM ADMIN 21/9/2022
];

@NgModule({
  declarations: [
    LandingComponent,
    ContainerFormComponent,
    DataListComponent,
    DeliveryPreviewComponent,
    ErrorScreenComponent,
    PostAuthComponent,
    PostCreatorComponent,
    PostEditComponent,
    PostPreviewComponent,
    PrivacyPolicyComponent,
    UserContactLandingComponent,
    UserDashboardComponent,
    UserOrdersComponent,
    MallDashboardComponent,
    MallGiftsComponent,
    MallStoresComponent,
    // FROM ADMIN 21/9/2022
    AdminLoginComponent,
    BankRegistrationComponent,
    CalendarCreatorComponent,
    CalendarDetailComponent,
    CategoryItemDetailComponent,
    CategoryItemsAdminComponent,
    TagCategoryCreatorComponent,
    ItemCategoryExpositionComponent,
    ItemSalesDetailComponent,
    MerchantBuyersComponent,
    MerchantOrdersComponent,
    NotificationCreatorComponent,
    NotificationsLogComponent,
    ReservationsComponent,
    ReservationDetailComponent,
    SaleDetailComponent,
    TagDetailComponent,
    TagsEditComponent,
    OrderReservationComponent,
    AdminOrderComponent,
    MetricsInfoComponent,
    MerchantSharedComponent,
    // FROM ADMIN 21/9/2022
  ],
  imports: [CommonModule, SharedModule, RouterModule.forChild(routes)],
})
export class OthersModule {}
