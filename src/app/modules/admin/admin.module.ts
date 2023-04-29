import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { SharedModule } from 'src/app/shared/shared.module';
import { MerchantItemsComponent } from './pages/merchant-items/merchant-items.component';
import { AdminComponent } from './admin/admin.component';
import { OrdersAndPreOrdersList } from './pages/ordersAndPreOrdersList/ordersAndPreOrdersList';
import { ReservationListComponent } from 'src/app/shared/components/reservation-list/reservation-list.component';
import { TagManagementComponent } from 'src/app/shared/dialogs/tag-management/tag-management.component';
import { CalendarCreatorComponent } from './pages/calendar-creator/calendar-creator.component';
import { TimeBlockComponent } from './pages/time-block/time-block.component';
import { ArticleCreatorComponent } from './pages/article-creator/article-creator.component';
import { ItemsDashboardComponent } from './pages/items-dashboard/items-dashboard.component';
import { CreateTagComponent } from './pages/create-tag/create-tag.component';
import { AnexoChoicesComponent } from 'src/app/shared/components/anexo-choices/anexo-choices.component';
import { TagsComponent } from './pages/tags/tags.component';
import { ManageTagComponent } from './pages/manage-tag/manage-tag.component';
import { ArticlePrivacyComponent } from 'src/app/shared/components/article-privacy/article-privacy.component';
import { ContactLandingContainerComponent } from 'src/app/shared/components/contact-landing-container/contact-landing-container.component';
import { ArticleEditorComponent } from './pages/article-editor/article-editor.component';
import { QrEditComponent } from 'src/app/shared/components/qr-edit/qr-edit.component';
import { AdminDashboardComponent } from './pages/admin-dashboard/admin-dashboard.component';
import { TagsViewComponent } from './pages/tags-view/tags-view.component';
import { BiosEditComponent } from './pages/bios-edit/bios-edit.component';
import { ViewConfigurationComponent } from './pages/view-configuration/view-configuration.component';
import { WebformMetricsComponent } from './pages/webform-metrics/webform-metrics.component';
import { OrderStatusViewComponent } from './pages/order-status-view/order-status-view.component';
import { OrderListComponent } from './pages/order-list/order-list.component';
import { TextOrImageComponent } from 'src/app/shared/components/text-or-image/text-or-image.component';
import { ItemWebformPreviewComponent } from './pages/item-webform-preview/item-webform-preview.component';
import { WebformOptionsSelectorComponent } from './pages/webform-options-selector/webform-options-selector.component';
import { FormResponsesComponent } from './pages/form-responses/form-responses.component';
import { OpenFormResponsesComponent } from './pages/open-form-responses/open-form-responses.component';
import { WebformsEditorComponent } from './pages/webforms-editor/webforms-editor.component';
import { BenefitsComponent } from './pages/benefits/benefits.component';
import { OrderExpensesComponent } from './pages/order-expenses/order-expenses.component';
import { FilteredBenefitsComponent } from './pages/filtered-benefits/filtered-benefits.component';
import { MerchantLandingComponent } from './pages/merchant-landing/merchant-landing.component';
import { DeliveryZonesComponent } from './pages/delivery-zones/delivery-zones.component';
import { OrdersByDeliveryComponent } from './pages/orders-by-delivery/orders-by-delivery.component';
import { OrderProcessComponent } from './pages/order-process/order-process.component';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { DeliveryOrdersComponent } from './pages/delivery-orders/delivery-orders.component';
import { NotificationCreatorComponent } from './pages/notification-creator/notification-creator.component';
import { FormCreatorComponent } from 'src/app/shared/components/form-creator/form-creator.component';
import { MediaUploadDndComponentComponent } from 'src/app/shared/components/media-upload-dnd-component/media-upload-dnd-component.component';

const routes: Routes = [
  { path: 'create-item', redirectTo: 'create-article', pathMatch: 'full' },
  // {
  //   path: 'create-article',
  //   component: ArticleCreatorComponent,
  // },
  {
    path: '',
    component: AdminComponent,
    children: [
      {
        path: '',
        redirectTo: 'admin/dashboard',
        pathMatch: 'full',
      },
      {
        path: 'items-dashboard',
        redirectTo: 'dashboard',
        pathMatch: 'full',
      },
      {
        path: 'entity-detail-metrics',
        redirectTo: 'dashboard',
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
        path: 'merchant-items',
        component: MerchantItemsComponent,
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
        path: 'old-dashboard',
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
        path: 'contact-landing/:idUser',
        component: ContactLandingContainerComponent,
      },
      {
        path: 'article-editor/:articleId',
        component: ArticleEditorComponent,
      },
      {
        path: 'slides-editor/:articleId',
        component: QrEditComponent,
      },
      {
        path: 'dashboard',
        component: AdminDashboardComponent,
      },
      {
        path: 'tags-view',
        component: TagsViewComponent,
      },
      {
        path: 'bios-edit',
        component: BiosEditComponent,
      },
      {
        path: 'view-configuration-items',
        component: ViewConfigurationComponent,
      },
      {
        path: 'view-configuration-cards',
        component: ViewConfigurationComponent,
      },
      {
        path: 'webform-metrics/:formId/:itemId',
        component: WebformMetricsComponent,
      },
      {
        path: 'options-selector',
        component: WebformOptionsSelectorComponent,
      },
      {
        path: 'webform-preview/:itemId',
        component: ItemWebformPreviewComponent,
      },
      {
        path: 'webform-responses/:formId/:itemId',
        component: FormResponsesComponent,
      },
      {
        path: 'webform-open-responses/:formId',
        component: OpenFormResponsesComponent,
      },
      {
        path: 'order-status-view',
        component: OrderStatusViewComponent,
      },
      {
        path: 'order-list',
        children: [
          {
            path: 'tags/:tagId',
            component: OrderListComponent,
          },
          {
            path: 'status/:status',
            component: OrderListComponent,
          },
          {
            path: 'process/:deliveryStatus',
            component: OrderListComponent,
          },
        ],
      },
      {
        path: 'webform-multiple-selection/:itemId',
        component: TextOrImageComponent,
      },
      {
        path: 'webforms-editor/:formId/:itemId',
        component: WebformsEditorComponent,
      },
      {
        path: 'benefits',
        component: BenefitsComponent,
      },
      {
        path: 'benefits/date',
        component: FilteredBenefitsComponent,
      },
      {
        path: 'order-expenses/:orderId',
        component: OrderExpensesComponent,
      },
      {
        path: 'delivery-zones',
        component: DeliveryZonesComponent,
      },
      {
        path: 'orders-by-delivery/:deliveryId',
        component: OrdersByDeliveryComponent,
      },
      {
        path: 'delivery-orders',
        component: DeliveryOrdersComponent,
      },
      {
        path: 'create-notification',
        component: NotificationCreatorComponent,
      },
      {
        path: 'create-notification/:notificationId',
        component: NotificationCreatorComponent,
      },
    ],
  },
  {
    path: 'tags',
    component: TagsComponent,
  },
  {
    path: 'order-process/:merchantId',
    component: OrderProcessComponent,
  },
  {
    path: 'form-creator/:itemId',
    component: FormCreatorComponent,
  },
  {
    path: 'media-upload/:entity/:entityId',
    component: MediaUploadDndComponentComponent,
  },
  {
    path: 'media-upload/:entity',
    component: MediaUploadDndComponentComponent,
  },
];

@NgModule({
  declarations: [
    MerchantItemsComponent,
    AdminComponent,
    OrdersAndPreOrdersList,
    CalendarCreatorComponent,
    TimeBlockComponent,
    ArticleCreatorComponent,
    ItemsDashboardComponent,
    CreateTagComponent,
    TagsComponent,
    ManageTagComponent,
    ArticleEditorComponent,
    AdminDashboardComponent,
    TagsViewComponent,
    BiosEditComponent,
    ViewConfigurationComponent,
    WebformMetricsComponent,
    OrderStatusViewComponent,
    OrderListComponent,
    ItemWebformPreviewComponent,
    WebformOptionsSelectorComponent,
    FormResponsesComponent,
    OpenFormResponsesComponent,
    WebformsEditorComponent,
    BenefitsComponent,
    OrderExpensesComponent,
    FilteredBenefitsComponent,
    DeliveryZonesComponent,
    OrdersByDeliveryComponent,
    OrderProcessComponent,
    DeliveryOrdersComponent,
    NotificationCreatorComponent,
  ],
  exports: [ArticleCreatorComponent],
  imports: [
    CommonModule,
    SharedModule,
    MatCheckboxModule,
    RouterModule.forChild(routes),
  ],
})
export class AdminModule {}
