import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { SharedModule } from 'src/app/shared/shared.module';
import { AdminOptionsComponent } from './pages/admin-options/admin-options.component';
import { SalesInfoComponent } from './pages/admin-options/sales-info/sales-info.component';
import { BankRegistrationComponent } from './pages/bank-registration/bank-registration.component';
import { CalendarCreatorComponent } from './pages/calendar-creator/calendar-creator.component';
import { CalendarDetailComponent } from './pages/calendar-detail/calendar-detail.component';
import { CategoryItemDetailComponent } from './pages/category-item-detail/category-item-detail.component';
import { CategoryItemsAdminComponent } from './pages/category-items-admin/category-items-admin.component';
import { CreateItemComponent } from './pages/create-item/create-item.component';
import { EntityDetailMetricsComponent } from './pages/entity-detail-metrics/entity-detail-metrics.component';
import { TagCategoryCreatorComponent } from './pages/item-category-creator/item-category-creator.component';
import { ItemCategoryExpositionComponent } from './pages/item-category-exposition/item-category-exposition.component';
import { ItemCreatorComponent } from './pages/item-creator/item-creator.component';
import { ItemSalesDetailComponent } from './pages/item-sales-detail/item-sales-detail.component';
import { MerchantBuyersComponent } from './pages/merchant-buyers/merchant-buyers.component';
import { MerchantDashboardComponent } from './pages/merchant-dashboard/merchant-dashboard.component';
import { MyStoreComponent } from './pages/merchant-dashboard/my-store/my-store.component';
import { MerchantDashboardv2Component } from './pages/merchant-dashboardv2/merchant-dashboardv2.component';
import { MerchantItemsComponent } from './pages/merchant-items/merchant-items.component';
import { MerchantOrdersComponent } from './pages/merchant-orders/merchant-orders.component';
import { MyCustomersComponent } from './pages/my-customers/my-customers.component';
import { ItemDisplayComponent } from './pages/item-display/item-display.component';
import { NotificationCreatorComponent } from './pages/notification-creator/notification-creator.component';
import { NotificationsLogComponent } from './pages/notifications-log/notifications-log.component';
import { OrderSalesComponent } from './pages/order-sales/order-sales.component';
import { ReservationDetailComponent } from './pages/reservation-detail/reservation-detail.component';
import { ReservationsComponent } from './pages/reservations/reservations.component';
import { ReservationsCreatorComponent } from './pages/reservations-creator/reservations-creator.component';
import { SaleDetailComponent } from './pages/sale-detail/sale-detail.component';
import { TagDetailComponent } from './pages/tag-detail/tag-detail.component';
import { TagsEditComponent } from './pages/tags-edit/tags-edit.component';
import { UserItemsComponent } from './pages/user-items/user-items.component';
import { AdminLoginComponent } from './pages/admin-login/admin-login.component';
import { MerchantSharedComponent } from './pages/merchant-shared/merchant-shared.component';
import { ActionsMenuComponent } from './pages/actions-menu/actions-menu.component';

const routes: Routes = [
  {
    path: 'admin-login',
    component: AdminLoginComponent,
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
    path: 'bank-registration/:saleflowId',
    component: BankRegistrationComponent,
  },
  {
    path: 'calendar-creator',
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
    path: 'create-item/:itemId',
    component: CreateItemComponent,
  },
  {
    path: 'create-item',
    component: CreateItemComponent,
  },
  {
    path: 'entity-detail-metrics',
    component: EntityDetailMetricsComponent,
    data: { animation: 'EntityDetailMetrics' },
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
    path: 'item-creator/:itemId',
    component: ItemCreatorComponent,
  },
  {
    path: 'item-creator',
    component: ItemCreatorComponent,
    data: { animation: 'ItemCreator' },
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
    path: 'merchant-dashboard/:merchantId',
    component: MerchantDashboardComponent,
    children: [
      {
        path: 'my-store',
        component: MyStoreComponent,
      },
    ],
  },
  {
    path: 'merchant-dashboardv2',
    component: MerchantDashboardv2Component,
  },
  {
    path: 'merchant-items',
    component: MerchantItemsComponent,
  },
  {
    path: 'merchant-shared/:merchantId',
    component: MerchantSharedComponent,
  },
  {
    path: 'merchant-orders',
    component: MerchantOrdersComponent,
  },
  {
    path: 'my-customers',
    component: MyCustomersComponent,
  },
  {
    path: 'item-display/:itemId',
    component: ItemDisplayComponent,
  },
  {
    path: 'item-display',
    component: ItemDisplayComponent,
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
    path: 'order-sales/:id',
    component: OrderSalesComponent,
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
    path: 'reservations-creator/:calendarId',
    component: ReservationsCreatorComponent,
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
    path: 'user-items',
    component: UserItemsComponent,
  },
  {
    path: 'options/:itemId',
    component: ActionsMenuComponent
  },
];

@NgModule({
  declarations: [
    AdminLoginComponent,
    AdminOptionsComponent,
    SalesInfoComponent,
    BankRegistrationComponent,
    CalendarCreatorComponent,
    CalendarDetailComponent,
    CategoryItemDetailComponent,
    CategoryItemsAdminComponent,
    CreateItemComponent,
    EntityDetailMetricsComponent,
    TagCategoryCreatorComponent,
    ItemCategoryExpositionComponent,
    ItemCreatorComponent,
    ItemSalesDetailComponent,
    MerchantBuyersComponent,
    MerchantDashboardComponent,
    MyStoreComponent,
    MerchantDashboardv2Component,
    MerchantItemsComponent,
    MerchantOrdersComponent,
    MyCustomersComponent,
    ItemDisplayComponent,
    NotificationCreatorComponent,
    NotificationsLogComponent,
    OrderSalesComponent,
    ReservationDetailComponent,
    ReservationsComponent,
    ReservationsCreatorComponent,
    SaleDetailComponent,
    TagDetailComponent,
    TagsEditComponent,
    UserItemsComponent,
    MerchantSharedComponent,
    ActionsMenuComponent,
  ],
  imports: [CommonModule, SharedModule, RouterModule.forChild(routes)],
})
export class AdminModule {}
