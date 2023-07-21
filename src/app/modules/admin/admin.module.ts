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
import { BiosEditComponent } from './pages/bios-edit/bios-edit.component';
import { ImageBannerComponent } from './pages/image-banner/image-banner.component';
import { QrEditComponent } from 'src/app/shared/components/qr-edit/qr-edit.component';
import { ContactLandingContainerComponent } from 'src/app/shared/components/contact-landing-container/contact-landing-container.component';
import { TagsComponent } from './pages/tags/tags.component';
import { ManageTagComponent } from './pages/manage-tag/manage-tag.component';
import { ArticlePrivacyComponent } from 'src/app/shared/components/article-privacy/article-privacy.component';
import { ArticleEditorComponent } from './pages/article-editor/article-editor.component';
import { AdminDashboardComponent } from './pages/admin-dashboard/admin-dashboard.component';
import { TagsViewComponent } from './pages/tags-view/tags-view.component';
import { ViewConfigurationComponent } from './pages/view-configuration/view-configuration.component';
import { WebformMetricsComponent } from './pages/webform-metrics/webform-metrics.component';
import { OrderStatusViewComponent } from './pages/order-status-view/order-status-view.component';
import { OrderListComponent } from './pages/order-list/order-list.component';
import { TextOrImageComponent } from 'src/app/shared/components/text-or-image/text-or-image.component';
import { ItemWebformPreviewComponent } from './pages/item-webform-preview/item-webform-preview.component';
import { WebformOptionsSelectorComponent } from './pages/webform-options-selector/webform-options-selector.component';
//import { FormResponsesComponent } from './pages/form-responses/form-responses.component';
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
import { ArticleDetailComponent } from './pages/article-detail/article-detail.component';
import { ReportingsComponent } from './pages/reportings/reportings.component';
import { FormCreatorComponent } from 'src/app/shared/components/form-creator/form-creator.component';
import { MediaUploadDndComponentComponent } from 'src/app/shared/components/media-upload-dnd-component/media-upload-dnd-component.component';
import { OrderSlidesComponent } from './pages/order-slides/order-slides.component';
import { RewardsDisplayComponent } from './pages/rewards-display/rewards-display.component';
import { DashboardLibraryComponent } from './pages/dashboard-library/dashboard-library.component';
import { OrderDataComponent } from './pages/order-data/order-data.component';
import { BuyerDataComponent } from './pages/buyer-data/buyer-data.component';
import { ReportsComponent } from './pages/reports/reports.component';
import { FilterPipeSearchPipe } from 'src/app/core/pipes/filter-pipe-search.pipe';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { AutofocusDirective } from 'src/app/core/directives/autofocus.directive';
import { ExpendituresComponent } from './pages/expenditures/expenditures.component';
import { IncomesComponent } from './pages/incomes/incomes.component';
import { CreateExpenditureComponent } from './pages/create-expenditure/create-expenditure.component';
import { CreateDeliveryZoneComponent } from './pages/create-delivery-zone/create-delivery-zone.component';
import { TransactionTypesComponent } from './pages/transaction-types/transaction-types.component';
import { QuestionToAdminComponent } from './pages/question-to-admin/question-to-admin.component';
import { RenameQuestionComponent } from './pages/rename-question/rename-question.component';
import { FormResponsesComponent } from 'src/app/shared/components/form-responses/form-responses.component';
import { FormResponsesByQuestionComponent } from 'src/app/shared/components/form-responses-by-question/form-responses-by-question.component';
import { MerchantsEntryComponent } from './pages/merchants-entry/merchants-entry.component';
import { ItemCreationComponent } from './pages/item-creation/item-creation.component';

import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { createTranslateLoader } from 'src/app/core/functions/create-translate-loader';
import { HttpClient } from '@angular/common/http';
import { ItemsSlidesEditorComponent } from 'src/app/shared/components/items-slides-editor/items-slides-editor.component';
import { ItemSelectorComponent } from './pages/item-selector/item-selector.component';
import { SupplierRegisterComponent } from './pages/supplier-register/supplier-register.component';
import { InventoryComponent } from './pages/inventory/inventory.component';
import { QuotationBidsComponent } from './pages/quotation-bids/quotation-bids.component';
import { InventoryCreatorComponent } from './pages/inventory-creator/inventory-creator.component';
import { SupplierRegistrationComponent } from './pages/supplier-registration/supplier-registration.component';
import { OrderProgressFilteringComponent } from './pages/order-progress-filtering/order-progress-filtering.component';
import { OrderProgressComponent } from './pages/order-progress/order-progress.component';
import { OrderFilteringComponent } from './pages/order-filtering/order-filtering.component';

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
        path: 'items-slides-editor',
        component: ItemsSlidesEditorComponent,
      },
      {
        path: 'items-slides-editor/:itemId',
        component: ItemsSlidesEditorComponent,
      },
      {
        path: 'item-creation/:itemId',
        component: ItemCreationComponent,
      },
      {
        path: 'item-creation',
        component: ItemCreationComponent,
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
        path: 'bios-edit',
        component: BiosEditComponent,
      },
      {
        path: 'image-banner',
        component: ImageBannerComponent,
      },
      {
        path: 'qr-edit',
        component: QrEditComponent,
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
        path: 'item-creation/:articleId',
        component: ArticleEditorComponent,
      },
      {
        path: 'slides-editor/:articleId',
        component: QrEditComponent,
      },
      {
        path: 'slides-editor',
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
      /*
      {
        path: 'webform-responses/:formId/:itemId',
        component: FormResponsesComponent,
      },*/
      {
        path: 'webform-responses/:itemId',
        component: FormResponsesComponent,
      },
      {
        path: 'webform-responses-filters/:itemId/:questionId',
        component: FormResponsesByQuestionComponent,
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
      // {
      //   // Asegurar que no se usa y borrar
      //   path: 'order-status-view',
      //   component: OrderStatusViewComponent,
      // },
      // {
      //   // Asegurar que no se usa y borrar
      //   path: 'order-list',
      //   children: [
      //     {
      //       path: 'tags/:tagId',
      //       component: OrderListComponent,
      //     },
      //     {
      //       path: 'status/:status',
      //       component: OrderListComponent,
      //     },
      //     {
      //       path: 'process/:deliveryStatus',
      //       component: OrderListComponent,
      //     },
      //   ],
      // },
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
      {
        path: 'order-slides/:orderId',
        component: OrderSlidesComponent,
      },
      {
        path: 'order-slides',
        component: OrderSlidesComponent,
      },
      {
        path: 'reports',
        redirectTo: 'reports/orders',
      },
      {
        path: 'reports',
        component: ReportsComponent,
        children: [
          {
            path: 'orders',
            component: OrderDataComponent,
          },
          {
            path: 'buyers',
            component: BuyerDataComponent,
          },
        ],
      },
      {
        path: 'reports/orders/list/:deliveryStatus',
        component: OrderListComponent,
      },
      {
        path: 'reports/buyers/list/:filter',
        component: OrderListComponent,
      },
      {
        path: 'reports/buyers/list',
        component: OrderListComponent,
      },
      {
        path: 'notifications-menu',
        component: RewardsDisplayComponent,
      },
      {
        path: 'item-selector',
        component: ItemSelectorComponent,
      },
      {
        path: 'item-selector/:quotationId',
        component: ItemSelectorComponent,
      },
      {
        path: 'quotations',
        component: InventoryComponent,
      },
      {
        path: 'quotation-bids/:quotationId',
        component: QuotationBidsComponent,
      },
    ],
  },
  {
    path: 'contact-landing/:idUser',
    component: ContactLandingContainerComponent,
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
    path: 'article-detail/:articleId',
    component: ArticleDetailComponent,
  },
  {
    path: 'reportings',
    component: ReportingsComponent,
  },
  {
    path: 'expenditures/:type',
    component: ExpendituresComponent,
  },
  {
    path: 'incomes',
    component: IncomesComponent,
  },
  {
    path: 'form-creator/:itemId',
    component: FormCreatorComponent,
  },
  {
    path: 'form-creator',
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
  {
    path: 'dashboard-library',
    component: DashboardLibraryComponent,
  },
  {
    path: 'create-expenditure/:type',
    component: CreateExpenditureComponent,
  },
  {
    path: 'edit-question/:webformid/:questionid',
    component: CreateDeliveryZoneComponent,
  },
  {
    path: 'transaction-types/:webformid',
    component: TransactionTypesComponent,
  },
  {
    path: 'question-to-admin/:webformid',
    component: QuestionToAdminComponent,
  },
  {
    path: 'rename-question/:webformid/:param',
    component: RenameQuestionComponent,
  },
  {
    path: 'merchants-entry',
    component: MerchantsEntryComponent,
  },
  /*
  {
    path: 'supplier-register',
    component: SupplierRegisterComponent,
  },*/
  {
    path: 'inventory',
    component: InventoryComponent,
  },
  {
    path: 'inventory-creator',
    component: InventoryCreatorComponent,
  },
  {
    path: 'inventory-creator/:itemId',
    component: InventoryCreatorComponent,
  },
  {
    path: 'supplier-orders',
    component: OrderProgressFilteringComponent
  },
  {
    path: 'supplier-register/:quotationId',
    component: SupplierRegistrationComponent,
  },
  {
    path: 'order-progress',
    component: OrderProgressComponent
  },
  {
    path: 'order-filtering',
    component: OrderFilteringComponent
  }
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
    BiosEditComponent,
    ImageBannerComponent,
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
    ArticleDetailComponent,
    ReportingsComponent,
    OrderSlidesComponent,
    DashboardLibraryComponent,
    ReportsComponent,
    OrderDataComponent,
    BuyerDataComponent,
    FilterPipeSearchPipe,
    ExpendituresComponent,
    IncomesComponent,
    CreateExpenditureComponent,
    CreateDeliveryZoneComponent,
    TransactionTypesComponent,
    QuestionToAdminComponent,
    RenameQuestionComponent,
    RewardsDisplayComponent,
    MerchantsEntryComponent,
    ItemCreationComponent,
    ItemSelectorComponent,
    SupplierRegisterComponent,
    InventoryComponent,
    QuotationBidsComponent,
    InventoryCreatorComponent,
    SupplierRegistrationComponent,
    OrderProgressFilteringComponent,
    OrderProgressComponent,
    OrderFilteringComponent
  ],
  exports: [ArticleCreatorComponent],
  imports: [
    CommonModule,
    SharedModule,
    MatCheckboxModule,
    // MatDaterangepickerModule,
    MatDatepickerModule,
    MatNativeDateModule,
    RouterModule.forChild(routes),
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: createTranslateLoader,
        deps: [HttpClient],
      },
    }),
  ],
})
export class AdminModule {}
