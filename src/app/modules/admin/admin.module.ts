import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { SharedModule } from 'src/app/shared/shared.module';
import { CreateItemComponent } from './pages/create-item/create-item.component';
import { EntityDetailMetricsComponent } from './pages/entity-detail-metrics/entity-detail-metrics.component';
import { MerchantItemsComponent } from './pages/merchant-items/merchant-items.component';
import { ItemDisplayComponent } from './pages/item-display/item-display.component';
import { ActionsMenuComponent } from './pages/actions-menu/actions-menu.component';
import { AdminComponent } from './admin/admin.component';
import { OrdersAndPreOrdersList } from './pages/ordersAndPreOrdersList/ordersAndPreOrdersList';
import { ReservationListComponent } from 'src/app/shared/components/reservation-list/reservation-list.component';
import { TagManagementComponent } from 'src/app/shared/dialogs/tag-management/tag-management.component';
import { CalendarCreatorComponent } from './pages/calendar-creator/calendar-creator.component';
import { TimeBlockComponent } from './pages/time-block/time-block.component';
import { CreateTagComponent } from './pages/create-tag/create-tag.component';

const routes: Routes = [
  {
    path: 'create-item',
    component: CreateItemComponent,
  },
  {
    path: 'create-tag',
    component: CreateTagComponent,
  },
  {
    path: '',
    component: AdminComponent,
    children: [
      { path: '', redirectTo: 'entity-detail-metrics', pathMatch: 'full' },
      {
        path: 'create-item/:itemId',
        component: CreateItemComponent,
      },
      {
        path: 'entity-detail-metrics',
        component: EntityDetailMetricsComponent,
        data: { animation: 'EntityDetailMetrics' },
      },
      {
        path: 'merchant-items',
        component: MerchantItemsComponent,
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
        path: 'options/:itemId',
        component: ActionsMenuComponent,
      },
      {
        path: 'orders',
        component: OrdersAndPreOrdersList,
      },
      {
        path: 'entity-detail-metrics/reservations/:calendar/:type',
        component: ReservationListComponent,
        data: { animation: 'EntityDetailMetrics' },
      },
      {
        path: 'tag-dialog',
        component: TagManagementComponent,
        data: { animation: 'EntityDetailMetrics' },
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
        path: 'time-block/:calendarId',
        component: TimeBlockComponent,
      },
    ],
  },
];

@NgModule({
  declarations: [
    CreateItemComponent,
    EntityDetailMetricsComponent,
    MerchantItemsComponent,
    ItemDisplayComponent,
    ActionsMenuComponent,
    AdminComponent,
    OrdersAndPreOrdersList,
    CalendarCreatorComponent,
    TimeBlockComponent,
    CreateTagComponent,
  ],
  imports: [CommonModule, SharedModule, RouterModule.forChild(routes)],
})
export class AdminModule {}
