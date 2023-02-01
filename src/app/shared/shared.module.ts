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
import { DragDropModule } from '@angular/cdk/drag-drop';
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
import { LoadingScreenComponent } from './components/loading-screen/loading-screen.component';
import { ReloadComponent } from './dialogs/reload/reload.component';
import { WhatsappMessageComponent } from './dialogs/whatsapp-message/whatsapp-message.component';
import { CurrencyInputComponent } from './components/currency-input/currency-input.component';
import { SelectDropdownComponent } from './components/select-dropdown/select-dropdown.component';
import { SettingsComponent } from './dialogs/settings/settings.component';
import { MetricsReservationComponent } from './components/metrics-reservation/metrics-reservation.component';
import { ReservationListComponent } from './components/reservation-list/reservation-list.component';
import { TagManagementComponent } from './dialogs/tag-management/tag-management.component';
import { TagsSelectorComponent } from './components/tags-selector/tags-selector.component';
import { TagsCarousellComponent } from './components/tags-carousell/tags-carousell.component';
import { HelperHeaderv3Component } from './components/helper-headerv3/helper-headerv3.component';
import { FunctionalityParametersComponent } from './components/functionality-parameters/functionality-parameters.component';
import { ConfirmActionDialogComponent } from './dialogs/confirm-action-dialog/confirm-action-dialog.component';
import { TagAsignationComponent } from './dialogs/tag-asignation/tag-asignation.component';
import { GeneralItemComponent } from './components/general-item/general-item.component';
import { TagTypeDialogComponent } from './dialogs/tag-type-dialog/tag-type-dialog.component';
import { MerchantContactComponent } from './components/merchant-contact/merchant-contact.component';
import { ArticlePrivacyComponent } from './components/article-privacy/article-privacy.component';
import { InputTransparentComponent } from './dialogs/input-transparent/input-transparent.component';
import { QrCodeDialogComponent } from './dialogs/qr-code-dialog/qr-code-dialog.component';
import { PostsXlsComponent } from './components/posts-xls/posts-xls.component';
import { AnexosDialogComponent } from './dialogs/anexos-dialog/anexos-dialog.component';
import { MediaDialogComponent } from './dialogs/media-dialog/media-dialog.component';
import { AnexoChoicesComponent } from './components/anexo-choices/anexo-choices.component';
import { BiosBannerComponent } from './components/bios-banner/bios-banner.component';
import { ItemListSelectorComponent } from './dialogs/item-list-selector/item-list-selector.component';
import { DialogFlowComponent } from './components/dialog-flow/dialog-flow.component';
import { BlankComponent } from './dialogs/blank/blank.component';
import { ArticleDialogComponent } from './dialogs/article-dialog/article-dialog.component';
import { AnexoLandingComponent } from './components/anexo-landing/anexo-landing.component';
import { ItemImagesComponent } from './dialogs/create-item-flow/item-images/item-images.component';
import { InfoDialogComponent } from './dialogs/info-dialog/info-dialog.component';
import { TagsDialogComponent } from './dialogs/tags-dialog/tags-dialog.component';
import { ContactLandingContainerComponent } from './components/contact-landing-container/contact-landing-container.component';
import { ContactLandingComponent } from './components/contact-landing/contact-landing.component';
import { LinkDialogComponent } from './dialogs/link-dialog/link-dialog.component';
import { BuyerCardComponent } from './components/buyer-card/buyer-card.component';
import { GradientFooterComponent } from './components/gradient-footer/gradient-footer.component';
import { OptionsBarComponent } from './components/options-bar/options-bar.component';
import { TagItemsComponent } from './components/tag-items/tag-items.component';
import { ImageEditorComponent } from './components/image-editor/image-editor.component';
import { CardComponent } from './components/card/card.component';
import { TitleIconHeaderComponent } from './components/title-icon-header/title-icon-header.component';
import { QrContentComponent } from './components/qr-content/qr-content.component';
import { QrEditComponent } from './components/qr-edit/qr-edit.component';
import { MenuButtonComponent } from './components/menu-button/menu-button.component';
import { LinksDialogComponent } from './dialogs/links-dialog/links-dialog.component';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';
import { MatBottomSheetModule } from '@angular/material/bottom-sheet';
import { MatDividerModule } from '@angular/material/divider';

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
  DragDropModule,
  MatMenuModule,
  MatIconModule,
  MatBottomSheetModule,
  MatDividerModule,
  MatButtonModule,
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
  TagAsignationComponent,
  HelperHeaderv2Component,
  ItemCardComponent,
  HeaderInfoComponent,
  MerchantInfoComponent,
  PreVisualizerComponent,
  PostPrivacyComponent,
  CartButtonComponent,
  CollaborationsComponent,
  InfoButtonComponent,
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
  ReloadComponent,
  WhatsappMessageComponent,
  CurrencyInputComponent,
  SelectDropdownComponent,
  SettingsComponent,
  MetricsReservationComponent,
  ReservationListComponent,
  TagManagementComponent,
  TagsSelectorComponent,
  TagsCarousellComponent,
  HelperHeaderv3Component,
  FunctionalityParametersComponent,
  ConfirmActionDialogComponent,
  GeneralItemComponent,
  MerchantContactComponent,
  InputTransparentComponent,
  ArticlePrivacyComponent,
  AnexosDialogComponent,
  QrCodeDialogComponent,
  PostsXlsComponent,
  TagAsignationComponent,
  MediaDialogComponent,
  AnexoChoicesComponent,
  BiosBannerComponent,
  DialogFlowComponent,
  ItemListSelectorComponent,
  BlankComponent,
  ArticleDialogComponent,
  AnexoLandingComponent,
  ItemImagesComponent,
  InfoDialogComponent,
  TagTypeDialogComponent,
  MediaDialogComponent,
  ItemListSelectorComponent,
  TagsDialogComponent,
  ContactLandingComponent,
  ContactLandingContainerComponent,
  LinkDialogComponent,
  BuyerCardComponent,
  GradientFooterComponent,
  OptionsBarComponent,
  TagItemsComponent,
  ImageEditorComponent,
  CardComponent,
  TitleIconHeaderComponent,
  QrContentComponent,
  QrEditComponent,
  MenuButtonComponent,
  LinksDialogComponent,
];

@NgModule({
  declarations,
  imports: [...imports, RouterModule],
  exports: [...declarations, ...imports],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  providers: [],
})
export class SharedModule {}
