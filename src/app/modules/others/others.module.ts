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
import { AdminLoginComponent } from './pages/admin-login/admin-login.component';
import { AdminOrderComponent } from './pages/admin-order/admin-order.component';
import { BankRegistrationComponent } from './pages/bank-registration/bank-registration.component';
import { CalendarDetailComponent } from './pages/calendar-detail/calendar-detail.component';
import { TagCategoryCreatorComponent } from './pages/item-category-creator/item-category-creator.component';
import { ItemCategoryExpositionComponent } from './pages/item-category-exposition/item-category-exposition.component';
import { MerchantBuyersComponent } from './pages/merchant-buyers/merchant-buyers.component';
import { MerchantOrdersComponent } from './pages/merchant-orders/merchant-orders.component';
import { MetricsInfoComponent } from './pages/metrics-info/metrics-info.component';
import { NotificationCreatorComponent } from './pages/notification-creator/notification-creator.component';
import { NotificationsLogComponent } from './pages/notifications-log/notifications-log.component';
import { OrderReservationComponent } from './pages/order-reservation/order-reservation.component';
import { ReservationDetailComponent } from './pages/reservation-detail/reservation-detail.component';
import { ReservationsComponent } from './pages/reservations/reservations.component';
import { TagDetailComponent } from './pages/tag-detail/tag-detail.component';
import { TagsEditComponent } from './pages/tags-edit/tags-edit.component';

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
    path: 'calendar-detail',
    component: CalendarDetailComponent,
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
    // FROM ADMIN 21/9/2022
    AdminLoginComponent,
    BankRegistrationComponent,
    CalendarDetailComponent,
    TagCategoryCreatorComponent,
    ItemCategoryExpositionComponent,
    MerchantBuyersComponent,
    MerchantOrdersComponent,
    NotificationCreatorComponent,
    NotificationsLogComponent,
    ReservationsComponent,
    ReservationDetailComponent,
    TagDetailComponent,
    TagsEditComponent,
    OrderReservationComponent,
    AdminOrderComponent,
    MetricsInfoComponent,
    // FROM ADMIN 21/9/2022
  ],
  imports: [CommonModule, SharedModule, RouterModule.forChild(routes)],
})
export class OthersModule {}
