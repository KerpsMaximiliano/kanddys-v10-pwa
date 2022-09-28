import { ClipboardModule } from '@angular/cdk/clipboard';
import { TextFieldModule } from '@angular/cdk/text-field';
import { CommonModule } from '@angular/common';
import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { NgxFormsModule } from '@mukuve/ngx-forms';
import { QRCodeModule } from 'angularx-qrcode';
import { GooglePlaceModule } from 'ngx-google-places-autocomplete';
import { NgxIntlTelInputModule } from 'ngx-intl-tel-input';
import { NgxPrintModule } from 'ngx-print';
import { SwiperModule } from 'ngx-swiper-wrapper';
import { environment } from './../../environments/environment';
import { DialogModule } from './../libs/dialog/dialog.module';
import { ActivitiesOptionComponent } from './components/activities-option/activities-option.component';
import { AnswerSelectorComponent } from './components/answer-selector/answer-selector.component';
import { AudioRecorderComponent } from './components/audio-recorder/audio-recorder.component';
import { BubbleButtonComponent } from './components/bubble-button/bubble-button.component';
import { CalendarComponent } from './components/calendar/calendar.component';
import { CardEditionButtonsComponent } from './components/card-edition-buttons/card-edition-buttons.component';
import { CartButtonComponent } from './components/cart-button/cart-button.component';
import { CloseTagComponent } from './components/close-tag/close-tag.component';
import { ContactButtonsComponent } from './components/contact-buttons/contact-buttons.component';
import { CtaButtonsComponent } from './components/cta-buttons/cta-buttons.component';
import { DynamicComponentComponent } from './components/dynamic-component/dynamic-component.component';
import { EnlistDisplayComponent } from './components/enlist-display/enlist-display.component';
import { ErrorMessageComponent } from './components/error-message/error-message.component';
import { FilterbarComponent } from './components/filterbar/filterbar.component';
import { FormQuestionsComponent } from './components/form-questions/form-questions.component';
import { GalleryDisplayerComponent } from './components/gallery-displayer/gallery-displayer.component';
import { GiftMessageComponent } from './components/gift-message/gift-message.component';
import { HeaderButtonComponent } from './components/header-button/header-button.component';
import { HeaderInfoAdminComponent } from './components/header-info-admin/header-info-admin.component';
import { HeaderInfoComponent } from './components/header-info/header-info.component';
import { HelperHeaderComponent } from './components/helper-header/helper-header.component';
import { HelperHeaderv2Component } from './components/helper-headerv2/helper-headerv2.component';
import { ImageInputComponent } from './components/image-input/image-input.component';
import { InfoButtonComponent } from './components/info-button/info-button.component';
import { InfoCardComponent } from './components/info-card/info-card.component';
import { InformationBoxComponent } from './components/information-box/information-box.component';
import { ItemCardAmountAndPriceComponent } from './components/item-card-amount-and-price/item-card-amount-and-price.component';
import { ItemCardComponent } from './components/item-card/item-card.component';
import { ItemGridComponent } from './components/item-grid/item-grid.component';
import { ItemListComponent } from './components/item-list/item-list.component';
import { ItemReservationComponent } from './components/item-reservation/item-reservation.component';
import { ItemSmallCardComponent } from './components/item-small-card/item-small-card.component';
import { ItemStatusComponent } from './components/item-status/item-status.component';
import { LeadwordListComponent } from './components/leadword-list/leadword-list.component';
import { MagicLinkDialogComponent } from './components/magic-link-dialog/magic-link-dialog.component';
import { MultistepFormComponent } from './components/multistep-form/multistep-form.component';
import { NotificationToggleComponent } from './components/notification-toggle/notification-toggle.component';
import { OneLineItemComponent } from './components/one-line-item/one-line-item.component';
import { PackageItemComponent } from './components/package-item/package-item.component';
import { PageComponentTabsComponent } from './components/page-component-tabs/page-component-tabs.component';
import { PostEditButtonsComponent } from './components/post-edit-buttons/post-edit-buttons.component';
import { PreVisualizerComponent } from './components/pre-visualizer/pre-visualizer.component';
import { ProviderInfoComponent } from './components/provider-info/provider-info.component';
import { QuestionItemComponent } from './components/question-item/question-item.component';
import { SaleflowItemComponent } from './components/saleflow-item/saleflow-item.component';
import { SearchbarComponent } from './components/searchbar/searchbar.component';
import { SeeFiltersComponent } from './components/see-filters/see-filters.component';
import { ShortCalendarComponent } from './components/short-calendar/short-calendar.component';
import { SingleItemListComponent } from './components/single-item-list/single-item-list.component';
import { SliderElementListComponent } from './components/slider-element-list/slider-element-list.component';
import { StickyButtonComponent } from './components/sticky-button/sticky-button.component';
import { SwitchButtonComponent } from './components/switch-button/switch-button.component';
import { TagsSquareComponent } from './components/tags-square/tags-square.component';
import { ThreejsCanvasComponent } from './components/threejs-canvas/threejs-canvas.component';
import { TitlebarComponent } from './components/titlebar/titlebar.component';
import { UserActionsComponent } from './components/user-actions/user-actions.component';
import { CollaborationsComponent } from './dialogs/collaborations/collaborations.component';
import { CommunityPreviewComponent } from './dialogs/community-preview/community-preview.component';
import { CustomFieldsComponent } from './dialogs/custom-fields/custom-fields.component';
import { EntityItemListComponent } from './dialogs/entity-item-list/entity-item-list.component';
import { FormFunnelV2Component } from './dialogs/form-funnel-v2/form-funnel-v2.component';
import { GeneralFormSubmissionDialogComponent } from './dialogs/general-form-submission-dialog/general-form-submission-dialog.component';
import { ImageViewComponent } from './dialogs/image-view/image-view.component';
import { ItemDashboardOptionsComponent } from './dialogs/item-dashboard-options/item-dashboard-options.component';
import { ItemSettingsComponent } from './dialogs/item-settings/item-settings.component';
import { MerchantInfoComponent } from './dialogs/merchant-info/merchant-info.component';
import { PostPrivacyComponent } from './dialogs/post-privacy/post-privacy.component';
import { SearchHashtagComponent } from './dialogs/search-hashtag/search-hashtag.component';
import { SetConfigComponent } from './dialogs/set-config/set-config.component';
import { ShareLinksComponent } from './dialogs/share-links/share-links.component';
import { ShowItemsComponent } from './dialogs/show-items/show-items.component';
import { StatusListComponent } from './dialogs/status-list/status-list.component';
import { StoreShareComponent } from './dialogs/store-share/store-share.component';
import { TriggerDialog } from './dialogs/trigger/trigger.dialog';
import { WarningStepsComponent } from './dialogs/warning-steps/warning-steps.component';
import { SingleActionDialogComponent } from './dialogs/single-action-dialog/single-action-dialog.component';
import { LoadingScreenComponent } from './components/loading-screen/loading-screen.component';
import { ItemComponent } from './components/item/item.component';
import { ReloadComponent } from './dialogs/reload/reload.component';
import { WhatsappMessageComponent } from './dialogs/whatsapp-message/whatsapp-message.component';
import { CurrencyInputComponent } from './components/currency-input/currency-input.component';
import { SelectDropdownComponent } from './components/select-dropdown/select-dropdown.component';
import { MetricsReservationComponent } from './components/metrics-reservation/metrics-reservation.component';
import { ReservationListComponent } from './components/reservation-list/reservation-list.component';

const imports = [
  CommonModule,
  DialogModule,
  NgxFormsModule,
  FormsModule,
  ReactiveFormsModule,
  NgxPrintModule,
  QRCodeModule,
  SwiperModule,
  TextFieldModule,
  NgxIntlTelInputModule,
  ClipboardModule,
  GooglePlaceModule,
];
const declarations = [
  // Pages
  CalendarComponent,
  ItemListComponent,
  CustomFieldsComponent,
  // ...
  TitlebarComponent,
  CommunityPreviewComponent,
  FilterbarComponent,
  SearchbarComponent,
  ContactButtonsComponent,
  SaleflowItemComponent,
  SearchHashtagComponent,
  WarningStepsComponent,
  LeadwordListComponent,
  GiftMessageComponent,
  ItemCardAmountAndPriceComponent,
  PageComponentTabsComponent,
  ShowItemsComponent,
  ImageInputComponent,
  AnswerSelectorComponent,
  HelperHeaderComponent,
  TriggerDialog,
  ItemGridComponent,
  ProviderInfoComponent,
  SeeFiltersComponent,
  CloseTagComponent,
  FormFunnelV2Component,
  StickyButtonComponent,
  MultistepFormComponent,
  ActivitiesOptionComponent,
  ErrorMessageComponent,
  DynamicComponentComponent,
  InfoCardComponent,
  InformationBoxComponent,
  ImageViewComponent,
  HeaderButtonComponent,
  TagsSquareComponent,
  CtaButtonsComponent,
  MagicLinkDialogComponent,
  HelperHeaderv2Component,
  ItemCardComponent,
  HeaderInfoComponent,
  MerchantInfoComponent,
  PreVisualizerComponent,
  PostPrivacyComponent,
  CartButtonComponent,
  CollaborationsComponent,
  InfoButtonComponent,
  PackageItemComponent,
  StatusListComponent,
  ItemStatusComponent,
  AudioRecorderComponent,
  StoreShareComponent,
  ShareLinksComponent,
  BubbleButtonComponent,
  HeaderInfoAdminComponent,
  PostEditButtonsComponent,
  UserActionsComponent,
  NotificationToggleComponent,
  GeneralFormSubmissionDialogComponent,
  SingleActionDialogComponent,
  SwitchButtonComponent,
  ItemSmallCardComponent,
  EntityItemListComponent,
  ItemDashboardOptionsComponent,
  FormQuestionsComponent,
  ShortCalendarComponent,
  SingleItemListComponent,
  SliderElementListComponent,
  OneLineItemComponent,
  QuestionItemComponent,
  ThreejsCanvasComponent,
  CardEditionButtonsComponent,
  EnlistDisplayComponent,
  GalleryDisplayerComponent,
  ItemReservationComponent,
  SetConfigComponent,
  ItemSettingsComponent,
  LoadingScreenComponent,
  ItemComponent,
  ReloadComponent,
  WhatsappMessageComponent,
  CurrencyInputComponent,
  SelectDropdownComponent,
  MetricsReservationComponent,
  ReservationListComponent,
  SingleActionDialogComponent
];

@NgModule({
  declarations,
  imports: [...imports, RouterModule],
  exports: [...declarations, ...imports],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  providers: [],
})
export class SharedModule {}
