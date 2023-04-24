import { ClipboardModule } from '@angular/cdk/clipboard';
import { DragDropModule } from '@angular/cdk/drag-drop';
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
import { DialogModule } from './../libs/dialog/dialog.module';
import { ActivitiesOptionComponent } from './components/activities-option/activities-option.component';
import { AnexoChoicesComponent } from './components/anexo-choices/anexo-choices.component';
import { AnexoLandingComponent } from './components/anexo-landing/anexo-landing.component';
import { AnswerSelectorComponent } from './components/answer-selector/answer-selector.component';
import { ArticlePrivacyComponent } from './components/article-privacy/article-privacy.component';
import { AudioRecorderComponent } from './components/audio-recorder/audio-recorder.component';
import { BiosBannerComponent } from './components/bios-banner/bios-banner.component';
import { BubbleButtonComponent } from './components/bubble-button/bubble-button.component';
import { CalendarComponent } from './components/calendar/calendar.component';
import { CardEditionButtonsComponent } from './components/card-edition-buttons/card-edition-buttons.component';
import { CardComponent } from './components/card/card.component';
import { CartButtonComponent } from './components/cart-button/cart-button.component';
import { CloseTagComponent } from './components/close-tag/close-tag.component';
import { ContactButtonsComponent } from './components/contact-buttons/contact-buttons.component';
import { CtaButtonsComponent } from './components/cta-buttons/cta-buttons.component';
import { CurrencyInputComponent } from './components/currency-input/currency-input.component';
import { DialogFlowComponent } from './components/dialog-flow/dialog-flow.component';
import { DynamicComponentComponent } from './components/dynamic-component/dynamic-component.component';
import { EnlistDisplayComponent } from './components/enlist-display/enlist-display.component';
import { ErrorMessageComponent } from './components/error-message/error-message.component';
import { FilterbarComponent } from './components/filterbar/filterbar.component';
import { FormQuestionsComponent } from './components/form-questions/form-questions.component';
import { FunctionalityParametersComponent } from './components/functionality-parameters/functionality-parameters.component';
import { GalleryDisplayerComponent } from './components/gallery-displayer/gallery-displayer.component';
import { GeneralDialogComponent } from './components/general-dialog/general-dialog.component';
import { GeneralItemComponent } from './components/general-item/general-item.component';
import { GiftMessageComponent } from './components/gift-message/gift-message.component';
import { HeaderButtonComponent } from './components/header-button/header-button.component';
import { HeaderInfoAdminComponent } from './components/header-info-admin/header-info-admin.component';
import { HeaderInfoComponent } from './components/header-info/header-info.component';
import { HelperHeaderComponent } from './components/helper-header/helper-header.component';
import { HelperHeaderv2Component } from './components/helper-headerv2/helper-headerv2.component';
import { HelperHeaderv3Component } from './components/helper-headerv3/helper-headerv3.component';
import { ImageEditorComponent } from './components/image-editor/image-editor.component';
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
import { LoadingScreenComponent } from './components/loading-screen/loading-screen.component';
import { MagicLinkDialogComponent } from './components/magic-link-dialog/magic-link-dialog.component';
import { MerchantContactComponent } from './components/merchant-contact/merchant-contact.component';
import { MetricsReservationComponent } from './components/metrics-reservation/metrics-reservation.component';
import { MultistepFormComponent } from './components/multistep-form/multistep-form.component';
import { NotificationToggleComponent } from './components/notification-toggle/notification-toggle.component';
import { OneLineItemComponent } from './components/one-line-item/one-line-item.component';
import { PageComponentTabsComponent } from './components/page-component-tabs/page-component-tabs.component';
import { PostEditButtonsComponent } from './components/post-edit-buttons/post-edit-buttons.component';
import { PostsXlsComponent } from './components/posts-xls/posts-xls.component';
import { PreVisualizerComponent } from './components/pre-visualizer/pre-visualizer.component';
import { ProviderInfoComponent } from './components/provider-info/provider-info.component';
import { QrContentComponent } from './components/qr-content/qr-content.component';
import { QrEditComponent } from './components/qr-edit/qr-edit.component';
import { QuestionItemComponent } from './components/question-item/question-item.component';
import { ReservationListComponent } from './components/reservation-list/reservation-list.component';
import { SaleflowItemComponent } from './components/saleflow-item/saleflow-item.component';
import { SearchbarComponent } from './components/searchbar/searchbar.component';
import { SeeFiltersComponent } from './components/see-filters/see-filters.component';
import { SelectDropdownComponent } from './components/select-dropdown/select-dropdown.component';
import { ShortCalendarComponent } from './components/short-calendar/short-calendar.component';
import { CalendarSwiperComponent } from './components/calendar-swiper/calendar-swiper.component';
import { SingleItemListComponent } from './components/single-item-list/single-item-list.component';
import { SliderElementListComponent } from './components/slider-element-list/slider-element-list.component';
import { StickyButtonComponent } from './components/sticky-button/sticky-button.component';
import { SwitchButtonComponent } from './components/switch-button/switch-button.component';
import { TagsCarousellComponent } from './components/tags-carousell/tags-carousell.component';
import { TagsSelectorComponent } from './components/tags-selector/tags-selector.component';
import { TagsSquareComponent } from './components/tags-square/tags-square.component';
import { ThreejsCanvasComponent } from './components/threejs-canvas/threejs-canvas.component';
import { TitleIconHeaderComponent } from './components/title-icon-header/title-icon-header.component';
import { TitlebarComponent } from './components/titlebar/titlebar.component';
import { UserActionsComponent } from './components/user-actions/user-actions.component';
import { AnexosDialogComponent } from './dialogs/anexos-dialog/anexos-dialog.component';
import { ArticleDialogComponent } from './dialogs/article-dialog/article-dialog.component';
import { BlankComponent } from './dialogs/blank/blank.component';
import { CollaborationsComponent } from './dialogs/collaborations/collaborations.component';
import { CommunityPreviewComponent } from './dialogs/community-preview/community-preview.component';
import { ConfirmActionDialogComponent } from './dialogs/confirm-action-dialog/confirm-action-dialog.component';
import { CustomFieldsComponent } from './dialogs/custom-fields/custom-fields.component';
import { EntityItemListComponent } from './dialogs/entity-item-list/entity-item-list.component';
import { FormFunnelV2Component } from './dialogs/form-funnel-v2/form-funnel-v2.component';
import { GeneralFormSubmissionDialogComponent } from './dialogs/general-form-submission-dialog/general-form-submission-dialog.component';
import { ImageViewComponent } from './dialogs/image-view/image-view.component';
import { InfoDialogComponent } from './dialogs/info-dialog/info-dialog.component';
import { InputTransparentComponent } from './dialogs/input-transparent/input-transparent.component';
import { ItemDashboardOptionsComponent } from './dialogs/item-dashboard-options/item-dashboard-options.component';
import { ItemListSelectorComponent } from './dialogs/item-list-selector/item-list-selector.component';
import { ItemSettingsComponent } from './dialogs/item-settings/item-settings.component';
import { MediaDialogComponent } from './dialogs/media-dialog/media-dialog.component';
import { MerchantInfoComponent } from './dialogs/merchant-info/merchant-info.component';
import { PostPrivacyComponent } from './dialogs/post-privacy/post-privacy.component';
// import { QrCodeDialogComponent } from './dialogs/qr-code-dialog/qr-code-dialog.component';
import { ReloadComponent } from './dialogs/reload/reload.component';
import { SearchHashtagComponent } from './dialogs/search-hashtag/search-hashtag.component';
import { SetConfigComponent } from './dialogs/set-config/set-config.component';
import { SettingsComponent } from './dialogs/settings/settings.component';
import { ShareLinksComponent } from './dialogs/share-links/share-links.component';
import { StoreShareComponent } from './dialogs/store-share/store-share.component';
import { TagAsignationComponent } from './dialogs/tag-asignation/tag-asignation.component';
import { TagManagementComponent } from './dialogs/tag-management/tag-management.component';
import { TagTypeDialogComponent } from './dialogs/tag-type-dialog/tag-type-dialog.component';
import { TagsDialogComponent } from './dialogs/tags-dialog/tags-dialog.component';
import { TriggerDialog } from './dialogs/trigger/trigger.dialog';
import { WarningStepsComponent } from './dialogs/warning-steps/warning-steps.component';
import { WhatsappMessageComponent } from './dialogs/whatsapp-message/whatsapp-message.component';
import { ContactLandingContainerComponent } from './components/contact-landing-container/contact-landing-container.component';
import { ContactLandingComponent } from './components/contact-landing/contact-landing.component';
import { LinkDialogComponent } from './dialogs/link-dialog/link-dialog.component';
import { BuyerCardComponent } from './components/buyer-card/buyer-card.component';
import { GradientFooterComponent } from './components/gradient-footer/gradient-footer.component';
import { OptionsBarComponent } from './components/options-bar/options-bar.component';
import { DescriptionDialogComponent } from './dialogs/description-dialog/description-dialog.component';
import { MenuButtonComponent } from './components/menu-button/menu-button.component';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';
import { ImagesCardComponent } from './components/images-card/images-card.component';
import { LinkCardComponent } from './components/link-card/link-card.component';
import { RouterOptionsComponent } from './components/router-options/router-options.component';
import { LinksDialogComponent } from './dialogs/links-dialog/links-dialog.component';
import { MatBottomSheetModule } from '@angular/material/bottom-sheet';
import { MatDividerModule } from '@angular/material/divider';
import { MatBadgeModule } from '@angular/material/badge';
import { MatDialogModule } from '@angular/material/dialog';
import { MatExpansionModule } from '@angular/material/expansion';
import { GradientCardComponent } from './components/gradient-card/gradient-card.component';
import { ItemImagesComponent } from './dialogs/item-images/item-images.component';
import { DotLoaderComponent } from './components/dot-loader/dot-loader.component';
import { DropdownMenuComponent } from './components/dropdown-menu/dropdown-menu.component';
import { MatSelectModule } from '@angular/material/select';
import { MatListModule } from '@angular/material/list';
import { MatStepperModule } from '@angular/material/stepper';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { ConfirmationDialogComponent } from './dialogs/confirmation-dialog/confirmation-dialog.component';
import { WebformTextareaQuestionComponent } from './components/webform-textarea-question/webform-textarea-question.component';
import { WebformMultipleSelectionQuestionComponent } from './components/webform-multiple-selection-question/webform-multiple-selection-question.component';
import { ClosedQuestionCardComponent } from './components/closed-question-card/closed-question-card.component';
import { StepperFormComponent } from './components/stepper-form/stepper-form.component';
import { CreateTagComponent } from './dialogs/create-tag/create-tag.component';
import { CollectionCardComponent } from './components/collection-card/collection-card.component';
import { MatCardModule } from '@angular/material/card';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatTabsModule } from '@angular/material/tabs';
import { CompactCardComponent } from './components/compact-card/compact-card.component';
import { WebformsCreatorComponent } from './components/webforms-creator/webforms-creator.component';
import { WebformQuestionDialogComponent } from './components/webform-question-dialog/webform-question-dialog.component';
import { WebformMultipleSelectionConfirmationComponent } from './components/webform-multiple-selection-confirmation/webform-multiple-selection-confirmation.component';
import { TextOrImageComponent } from './components/text-or-image/text-or-image.component';
import { WebformAddAnotherQuestionComponent } from './components/webform-add-another-question/webform-add-another-question.component';
import { WebformNameQuestionComponent } from './components/webform-name-question/webform-name-question.component';
import { MsgDialogComponent } from './dialogs/msg-dialog/msg-dialog.component';
import { DialogFormComponent } from './dialogs/dialog-form/dialog-form.component';
import { NamedExpenseComponent } from './components/named-expense/named-expense.component';
import { TitledExpenseComponent } from './components/titled-expense/titled-expense.component';
import { OrderExpensesListComponent } from './components/order-expenses-list/order-expenses-list.component';
import { InfoCard2Component } from './components/info-card2/info-card2.component';
import { MerchantStepperFormComponent } from './components/merchant-stepper-form/merchant-stepper-form.component';
import { StringInputComponent } from './components/string-input/string-input.component';
import { ArticleStepperFormComponent } from './components/article-stepper-form/article-stepper-form.component';
import { FacturasDisplay2Component } from './components/facturas-display2/facturas-display2.component';
import { FullMenuButtonComponent } from './components/full-menu-button/full-menu-button.component';
import { NotificationDialogComponent } from './dialogs/notification-dialog/notification-dialog.component';
import { FormCreatorComponent } from './components/form-creator/form-creator.component';
import { MediaUploadDndComponentComponent } from './components/media-upload-dnd-component/media-upload-dnd-component.component';

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
  MatButtonModule,
  MatMenuModule,
  MatIconModule,
  MatBottomSheetModule,
  MatDividerModule,
  MatExpansionModule,
  MatBadgeModule,
  MatSelectModule,
  MatListModule,
  MatDialogModule,
  MatStepperModule,
  MatFormFieldModule,
  MatInputModule,
  MatSnackBarModule,
  MatCardModule,
  MatCheckboxModule,
  MatGridListModule,
  MatTabsModule,
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
  PostsXlsComponent,
  MediaDialogComponent,
  DialogFlowComponent,
  GeneralDialogComponent,
  AnexoChoicesComponent,
  BiosBannerComponent,
  ItemListSelectorComponent,
  BlankComponent,
  ArticleDialogComponent,
  AnexoLandingComponent,
  ItemImagesComponent,
  InfoDialogComponent,
  TagTypeDialogComponent,
  TagsDialogComponent,
  ContactLandingComponent,
  LinkDialogComponent,
  BuyerCardComponent,
  GradientFooterComponent,
  OptionsBarComponent,
  ImageEditorComponent,
  CardComponent,
  TitleIconHeaderComponent,
  QrContentComponent,
  QrEditComponent,
  GeneralDialogComponent,
  DescriptionDialogComponent,
  MenuButtonComponent,
  ImagesCardComponent,
  LinkCardComponent,
  RouterOptionsComponent,
  LinksDialogComponent,
  GradientCardComponent,
  CalendarSwiperComponent,
  DotLoaderComponent,
  DropdownMenuComponent,
  ConfirmationDialogComponent,
  WebformTextareaQuestionComponent,
  WebformMultipleSelectionQuestionComponent,
  ClosedQuestionCardComponent,
  StepperFormComponent,
  CreateTagComponent,
  CollectionCardComponent,
  CompactCardComponent,
  WebformsCreatorComponent,
  WebformQuestionDialogComponent,
  WebformMultipleSelectionConfirmationComponent,
  TextOrImageComponent,
  WebformAddAnotherQuestionComponent,
  WebformNameQuestionComponent,
  MsgDialogComponent,
  DialogFormComponent,
  NamedExpenseComponent,
  TitledExpenseComponent,
  OrderExpensesListComponent,
  InfoCard2Component,
  MerchantStepperFormComponent,
  StringInputComponent,
  ArticleStepperFormComponent,
  FacturasDisplay2Component,
  FullMenuButtonComponent,
  NotificationDialogComponent,
  FormCreatorComponent,
  MediaUploadDndComponentComponent
];

@NgModule({
  declarations,
  imports: [...imports, RouterModule],
  exports: [...declarations, ...imports],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  providers: [],
})
export class SharedModule {}
