import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { SharedModule } from 'src/app/shared/shared.module';
import { CreateItemComponent } from './pages/create-item/create-item.component';
import { MerchantItemsComponent } from './pages/merchant-items/merchant-items.component';
import { ItemDisplayComponent } from './pages/item-display/item-display.component';
import { ActionsMenuComponent } from './pages/actions-menu/actions-menu.component';
import { AdminComponent } from './admin/admin.component';
import { OrdersAndPreOrdersList } from './pages/ordersAndPreOrdersList/ordersAndPreOrdersList';
import { ReservationListComponent } from 'src/app/shared/components/reservation-list/reservation-list.component';
import { TagManagementComponent } from 'src/app/shared/dialogs/tag-management/tag-management.component';
import { CalendarCreatorComponent } from './pages/calendar-creator/calendar-creator.component';
import { TimeBlockComponent } from './pages/time-block/time-block.component';
import { ArticleCreatorComponent } from './pages/article-creator/article-creator.component';
import { ArticleParamsComponent } from './pages/article-params/article-params.component';
import { ItemsDashboardComponent } from './pages/items-dashboard/items-dashboard.component';
import { CreateTagComponent } from './pages/create-tag/create-tag.component';
import { AnexoChoicesComponent } from 'src/app/shared/components/anexo-choices/anexo-choices.component';
import { TagsComponent } from './pages/tags/tags.component';
import { ManageTagComponent } from './pages/manage-tag/manage-tag.component';
import { ArticlePrivacyComponent } from 'src/app/shared/components/article-privacy/article-privacy.component';
import { ArticleEditorComponent } from './pages/article-editor/article-editor.component';

const routes: Routes = [
  { path: 'create-item', redirectTo: 'create-article', pathMatch: 'full' },
  // {
  //   path: 'create-article',
  //   component: ArticleCreatorComponent,
  // },
  {
    path: 'article-params',
    component: ArticleParamsComponent,
  },
  {
    path: '',
    component: AdminComponent,
    children: [
      {
        path: '',
        redirectTo: 'admin/entity-detail-metrics',
        pathMatch: 'full',
      },
      {
        path: 'items-dashboard',
        redirectTo: 'entity-detail-metrics',
        pathMatch: 'full',
      },
      {
        path: 'create-item/:itemId',
        redirectTo: 'create-article/:itemId',
        pathMatch: 'full',
      },
      {
        path: 'create-article/:itemId',
        component: ArticleCreatorComponent,
      },
      {
        path: 'article-params/:itemId',
        component: ArticleParamsComponent,
      },
      /*{
        path: 'entity-detail-metrics',
        component: EntityDetailMetricsComponent,
        data: { animation: 'EntityDetailMetrics' },
      },*/
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
      {
        path: 'entity-detail-metrics',
        component: ItemsDashboardComponent,
      },
      {
        path: 'create-tag',
        component: CreateTagComponent,
      },
      {
        path: 'create-tag/:tagId',
        component: CreateTagComponent,
      },
      {
        path: 'article-choices/:articleId',
        component: AnexoChoicesComponent,
      },
      {
        path: 'article-choices',
        component: AnexoChoicesComponent,
      },
      {
        path: 'manage-tag',
        component: ManageTagComponent,
      },
      {
        path: 'article-privacy/:templateId',
        component: ArticlePrivacyComponent,
      },
      {
        path: "article-editor/:articleId",
        component: ArticleEditorComponent
      }
    ],
  },
  {
    path: 'tags',
    component: TagsComponent
  },
];

@NgModule({
  declarations: [
    CreateItemComponent,
    MerchantItemsComponent,
    ItemDisplayComponent,
    ActionsMenuComponent,
    AdminComponent,
    OrdersAndPreOrdersList,
    CalendarCreatorComponent,
    TimeBlockComponent,
    ArticleCreatorComponent,
    ArticleParamsComponent,
    ItemsDashboardComponent,
    CreateTagComponent,
    TagsComponent,
    ManageTagComponent,
    ArticleEditorComponent
  ],
  exports: [ArticleCreatorComponent],
  imports: [CommonModule, SharedModule, RouterModule.forChild(routes)],
})
export class AdminModule {}
