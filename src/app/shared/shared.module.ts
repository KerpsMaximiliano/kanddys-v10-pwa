import { PartnerReceiptsComponent } from './pages/partner-receipts/partner-receipts.component';
import { InvitationComponent } from './pages/invitation/invitation.component';
import { HomeComponent } from './pages/home/home.component';
import { NgxPrintModule } from 'ngx-print';
import { ActionsDialog } from './dialogs/actions/actions.dialog';
import { CommonModule } from '@angular/common';
import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { NgxFormsModule } from '@mukuve/ngx-forms';
import { QRCodeModule } from 'angularx-qrcode';
import { TextFieldModule } from '@angular/cdk/text-field';
import {
  FacebookLoginProvider,
  GoogleLoginProvider,
  SocialAuthServiceConfig,
} from 'angularx-social-login';
import {
  SwiperModule,
  SwiperConfigInterface,
  SWIPER_CONFIG,
} from 'ngx-swiper-wrapper';
import { environment } from './../../environments/environment';
import { DialogModule } from './../libs/dialog/dialog.module';
import { ButtonComponent } from './components/button/button.component';
import { CardComponent } from './components/card/card.component';
import { FilterbarComponent } from './components/filterbar/filterbar.component';
import { TabComponent } from './components/tabs/tab.component';
import { TabsComponent } from './components/tabs/tabs.component';
import { TitlebarComponent } from './components/titlebar/titlebar.component';
import { AuthDialog } from './dialogs/auth/auth.dialog';
import { LongPressDirective } from './directives/long-press.directive';
import { MakeTriggerComponent } from './pages/make-trigger/make-trigger.component';
import { HeaderComponent } from './sections/header/header.component';
import { NavHeaderComponent } from './sections/nav-header/nav-header.component';
import { NavbarComponent } from './sections/navbar/navbar.component';
import { ScopeMenuComponent } from './sections/scope-menu/scope-menu.component';
import { FormDialog } from './dialogs/form/form.dialog';
import { ContactButtonsComponent } from './components/contact-buttons/contact-buttons.component';
import { SaleflowItemComponent } from './components/saleflow-item/saleflow-item.component';
import { SearchHashtagComponent } from './dialogs/search-hashtag/search-hashtag.component';
import { WarningStepsComponent } from './dialogs/warning-steps/warning-steps.component';
import { CommunityPreviewComponent } from './dialogs/community-preview/community-preview.component';
import { SearchbarComponent } from './components/searchbar/searchbar.component';
import { AnswerSelectorComponent } from './components/answer-selector/answer-selector.component';
import { PageComponentTabsComponent } from './components/page-component-tabs/page-component-tabs.component';
import { LeadwordListComponent } from './components/leadword-list/leadword-list.component';
import { ResourceListComponent } from './components/resource-list/resource-list.component';
import { GiftMessageComponent } from './components/gift-message/gift-message.component';
import { ImageInputComponent } from './components/image-input/image-input.component';
import { ItemCardAmountAndPriceComponent } from './components/item-card-amount-and-price/item-card-amount-and-price.component';
import { HelperHeaderComponent } from './components/helper-header/helper-header.component';
import { QrDialog } from './dialogs/qr/qr.dialog';
import { ShowItemsComponent } from './dialogs/show-items/show-items.component';
import { TriggerDialog } from './dialogs/trigger/trigger.dialog';
import { ItemGridComponent } from './components/item-grid/item-grid.component';
import { ProviderInfoComponent } from './components/provider-info/provider-info.component';
import { SeeFiltersComponent } from './components/see-filters/see-filters.component';
import { CloseTagComponent } from './components/close-tag/close-tag.component';
import { SwiperComponent } from './components/swiper/swiper.component';
import { FormFunnelV2Component } from './dialogs/form-funnel-v2/form-funnel-v2.component';
import { StickyButtonComponent } from './components/sticky-button/sticky-button.component';
import { MultistepFormComponent } from './components/multistep-form/multistep-form.component';
import { ActivitiesOptionComponent } from './components/activities-option/activities-option.component';
import { ErrorMessageComponent } from './components/error-message/error-message.component';
import { DynamicComponentComponent } from './components/dynamic-component/dynamic-component.component';
import { InfoCardComponent } from './components/info-card/info-card.component';
import { ListComponent } from './components/list/list.component';
import { ItemListComponent } from './components/item-list/item-list.component';
import { CustomFieldsComponent } from './dialogs/custom-fields/custom-fields.component';
import { CalendarComponent } from './components/calendar/calendar.component';
import { InformationBoxComponent } from './components/information-box/information-box.component';
import { ImageViewComponent } from './dialogs/image-view/image-view.component';
import { HeaderButtonComponent } from './components/header-button/header-button.component';
import { TagsSquareComponent } from './components/tags-square/tags-square.component';
import { CtaButtonsComponent } from './components/cta-buttons/cta-buttons.component';
import { MagicLinkDialogComponent } from './components/magic-link-dialog/magic-link-dialog.component';
import { HelperHeaderv2Component } from './components/helper-headerv2/helper-headerv2.component';
import { ItemCardComponent } from './components/item-card/item-card.component';
import { HeaderInfoComponent } from './components/header-info/header-info.component';
import { MerchantInfoComponent } from './dialogs/merchant-info/merchant-info.component';
import { PreVisualizerComponent } from './components/pre-visualizer/pre-visualizer.component';
import { PostPrivacyComponent } from './dialogs/post-privacy/post-privacy.component';
import { NgxIntlTelInputModule } from 'ngx-intl-tel-input';

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
];
const declarations = [
  // Pages
  CalendarComponent,
  HomeComponent,
  InvitationComponent,
  ItemListComponent,
  CustomFieldsComponent,
  PartnerReceiptsComponent,
  // ...
  LongPressDirective,
  AuthDialog,
  FormDialog,
  ActionsDialog,
  HeaderComponent,
  NavHeaderComponent,
  CardComponent,
  TitlebarComponent,
  CommunityPreviewComponent,
  FilterbarComponent,
  SearchbarComponent,
  ResourceListComponent,
  ContactButtonsComponent,
  SaleflowItemComponent,
  SearchHashtagComponent,
  WarningStepsComponent,
  NavbarComponent,
  LeadwordListComponent,
  GiftMessageComponent,
  ItemCardAmountAndPriceComponent,
  PageComponentTabsComponent,
  ShowItemsComponent,
  ImageInputComponent,
  AnswerSelectorComponent,
  HelperHeaderComponent,
  ScopeMenuComponent,
  ButtonComponent,
  TabsComponent,
  TabComponent,
  MakeTriggerComponent,
  QrDialog,
  TriggerDialog,
  ItemGridComponent,
  ProviderInfoComponent,
  SeeFiltersComponent,
  CloseTagComponent,
  SwiperComponent,
  FormFunnelV2Component,
  StickyButtonComponent,
  MultistepFormComponent,
  ActivitiesOptionComponent,
  ErrorMessageComponent,
  DynamicComponentComponent,
  InfoCardComponent,
  ListComponent,
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
];

@NgModule({
  declarations,
  imports: [...imports, RouterModule],
  exports: [...declarations, ...imports],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  entryComponents: [AuthDialog, FormDialog, ActionsDialog],
  providers: [
    {
      provide: 'SocialAuthServiceConfig',
      useValue: {
        autoLogin: false,
        providers: [
          {
            id: GoogleLoginProvider.PROVIDER_ID,
            provider: new GoogleLoginProvider(environment.socials.googleId),
          },
          {
            id: FacebookLoginProvider.PROVIDER_ID,
            provider: new FacebookLoginProvider(environment.socials.facebookId),
          },
        ],
      } as SocialAuthServiceConfig,
    },
  ],
})
export class SharedModule {}
