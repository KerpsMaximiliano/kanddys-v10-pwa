import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from './../../shared/shared.module';
import { CategoryItemsComponent } from './pages/category-items/category-items.component';
import { CreateGiftcardComponent } from './pages/create-giftcard/create-giftcard.component';
import { HeavenlyBalloonsComponent } from './pages/heavenly-balloons/heavenly-balloons.component';
import { LlStudioOrderFormComponent } from './pages/ll-studio-order-form/ll-studio-order-form.component';
import { OrderDetailComponent } from './pages/order-detail/order-detail.component';
import { RedirectionsComponent } from './pages/redirections/redirections.component';
import { NewAddressComponent } from './pages/new-address/new-address.component';
import { EcommerceComponent } from './ecommerce/ecommerce.component';
import { CheckoutComponent } from './pages/checkout/checkout.component';
import { PaymentsComponent } from './pages/payments/payments.component';
import { StoreComponent } from './pages/store/store.component';
import { ReservationsComponent } from './pages/reservations/reservations.component';
import { AppointmentsModule } from '../appointments/appointments.module';
import { PaymentsRedirectionComponent } from './pages/payments-redirection/payments-redirection.component';
import { ArticleAccessComponent } from './pages/article-access/article-access.component';
import { ArticleDetailComponent } from './pages/article-detail/article-detail.component';
import { CreateArticleComponent } from './pages/create-article/create-article.component';
import { AdminModule } from '../admin/admin.module';
import { TermsOfUseComponent } from './pages/terms-of-use/terms-of-use.component';
import { ContactLandingContainerComponent } from 'src/app/shared/components/contact-landing-container/contact-landing-container.component';
import { ContactLandingComponent } from 'src/app/shared/components/contact-landing/contact-landing.component';
import { CollectionsComponent } from 'src/app/modules/ecommerce/pages/collections/collections.component';
import { TagItemsComponent } from 'src/app/modules/ecommerce/pages/tag-items/tag-items.component';
import { GiftDetailComponent } from './pages/gift-detail/gift-detail.component';
import { MerchantLandingComponent } from '../admin/pages/merchant-landing/merchant-landing.component';
import { StoreAssistantComponent } from './pages/store-assistant/store-assistant.component';
import { OrderProcessComponent } from '../admin/pages/order-process/order-process.component';
import { RegistroKioskoComponent } from './pages/registro-kiosko/registro-kiosko.component';
import { KioskoViewComponent } from './pages/kiosko-view/kiosko-view.component';
import { LinksPageComponent } from './pages/links-page/links-page.component';
import { LinkRegisterComponent } from './pages/link-register/link-register.component';
import { LinkUpdateComponent } from './pages/link-update/link-update.component';
import { MyContactRegisterComponent } from './pages/my-contact-register/my-contact-register.component';
import { Fase1LandingComponent } from './pages/fase1-landing/fase1-landing.component';
import { ArticleUploadComponent } from './pages/article-upload/article-upload.component';
import { TextEditionAndPreviewComponent } from './pages/text-edition-and-preview/text-edition-and-preview.component';
import { ImageBannerComponent } from '../admin/pages/image-banner/image-banner.component';
import { QrEditComponent } from 'src/app/shared/components/qr-edit/qr-edit.component';
import { PostPreviewComponent } from './pages/post-preview/post-preview.component';
import { PostEditionComponent } from './pages/post-edition/post-edition.component';
import { WebformClientViewComponent } from 'src/app/shared/components/webform-client-view/webform-client-view.component';
import { WebformOptionsSelectorComponent } from '../admin/pages/webform-options-selector/webform-options-selector.component';
import { PostsSlidesEditorComponent } from 'src/app/shared/components/posts-slides-editor/posts-slides-editor.component';
import { AllItemsComponent } from './pages/all-items/all-items.component';
import { CartComponent } from './pages/cart/cart.component';
import { ReceiverFormComponent } from './pages/receiver-form/receiver-form.component';
import { NewSymbolComponent } from './pages/new-symbol/new-symbol.component';
import { GiftcardDetailsComponent } from './pages/giftcard-details/giftcard-details.component';
import { AmbassadorStoreComponent } from './pages/ambassador-store/ambassador-store.component';
import { SymbolDetailComponent } from './pages/symbol-detail/symbol-detail.component';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { HttpClient } from '@angular/common/http';
import { createTranslateLoader } from 'src/app/core/functions/create-translate-loader';
import { OrderConfirmationComponent } from './pages/order-confirmation/order-confirmation.component';
import { InvalidMagicLinkComponent } from './pages/invalid-magic-link/invalid-magic-link.component';
import { ItemSelectorComponent } from 'src/app/shared/components/item-selector/item-selector.component';
import { InventoryComponent } from 'src/app/shared/components/inventory/inventory.component';
import { QuotationBidsComponent } from './pages/quotation-bids/quotation-bids.component';
import { SupplierRegistrationComponent } from '../../shared/components/supplier-registration/supplier-registration.component';
import { InventoryCreatorComponent } from './pages/inventory-creator/inventory-creator.component';
import { ConfirmQuotationComponent } from './pages/confirm-quotation/confirm-quotation.component';
import { ItemCreationComponent } from './pages/item-creation/item-creation.component';
import { FormCreatorComponent } from 'src/app/shared/components/form-creator/form-creator.component';
import { ItemsSlidesEditorComponent } from 'src/app/shared/components/items-slides-editor/items-slides-editor.component';
import { ProviderItemsComponent } from './pages/provider-items/provider-items.component';
import { ClubLandingComponent } from './pages/club-landing/club-landing.component';
import { ConfirmClubRegistrationComponent } from './pages/confirm-club-registration/confirm-club-registration.component';
import { MagicLinkSentComponent } from './pages/magic-link-sent/magic-link-sent.component';
import { MerchantRegisterComponent } from './pages/merchant-register/merchant-register.component';
import { LoginLandingComponent } from './pages/login-landing/login-landing.component';
import { NotificationAccessScreenComponent } from './pages/notification-access-screen/notification-access-screen.component';
import { ProfloraCampainComponent } from './pages/proflora-campain/proflora-campain.component';
import { ChatRoomComponent } from './pages/chat-room/chat-room.component';
import { DaliahChatComponent } from './pages/daliah-chat/daliah-chat.component';
import { DaliaTrainingComponent } from './pages/dalia-training/dalia-training.component';

const routes: Routes = [
  {
    path: 'merchant-register',
    component: MerchantRegisterComponent,
  },
  {
    path: 'login-landing',
    component: LoginLandingComponent,
  },
  {
    path: 'notification-access-screen',
    component: NotificationAccessScreenComponent,
  },
  {
    path: 'heavenly-balloons/:merchantId/:calendarId/:automationName',
    component: HeavenlyBalloonsComponent,
  },
  {
    path: 'll-studio-order-form/:merchantId/:calendarId/:automationName',
    component: LlStudioOrderFormComponent,
  },
  {
    path: 'redirections',
    component: RedirectionsComponent,
  },
  {
    path: 'article-access/:templateId',
    component: ArticleAccessComponent,
  },
  {
    path: 'order-info/:orderId',
    redirectTo: 'order-detail/:orderId',
    pathMatch: 'full',
  },
  {
    path: 'order-detail/:orderId',
    component: OrderDetailComponent,
  },
  {
    path: 'order-confirmation/:orderId',
    component: OrderConfirmationComponent,
  },
  {
    path: 'contact-landing/:idUser',
    component: ContactLandingContainerComponent,
  },
  {
    path: 'megaphone-v3/:merchantSlug',
    redirectTo: ':merchantSlug/store',
    pathMatch: 'full',
  },
  {
    path: 'store/:merchantSlug',
    redirectTo: ':merchantSlug/store',
    pathMatch: 'full',
  },
  {
    path: 'gift-detail/:orderId',
    component: GiftDetailComponent,
  },
  {
    path: 'merchant-landing',
    component: MerchantLandingComponent,
  },
  {
    path: 'registro-kiosko',
    component: RegistroKioskoComponent,
  },
  {
    path: 'kiosko-view/:userId',
    component: KioskoViewComponent,
  },
  {
    path: 'links-view/:userId',
    component: LinksPageComponent,
  },
  {
    path: 'link-register/:userId',
    component: LinkRegisterComponent,
  },
  {
    path: 'link-update/:userId',
    component: LinkUpdateComponent,
  },
  {
    path: 'register-my-contact/:userId',
    component: MyContactRegisterComponent,
  },
  {
    path: 'merchant-signup',
    component: Fase1LandingComponent,
  },
  {
    path: 'article-upload',
    component: ArticleUploadComponent,
  },
  {
    path: 'webform-options-selector',
    component: WebformOptionsSelectorComponent,
  },
  {
    path: 'invalid-link',
    component: InvalidMagicLinkComponent,
  },
  {
    path: 'supplier-items-selector',
    component: ItemSelectorComponent,
  },
  {
    path: 'supplier-items-selector/:quotationId',
    component: ItemSelectorComponent,
  },
  {
    path: 'supplier-register/:quotationId',
    component: SupplierRegistrationComponent,
  },
  {
    path: 'supplier-register',
    component: SupplierRegistrationComponent,
  },
  {
    path: 'quotations',
    component: InventoryComponent,
  },
  {
    path: 'item-management/:itemId',
    component: ItemCreationComponent,
  },
  {
    path: 'item-management',
    component: ItemCreationComponent,
  },
  {
    path: 'webform-creator/:itemId',
    component: FormCreatorComponent,
  },
  {
    path: 'webform-creator',
    component: FormCreatorComponent,
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
    path: 'quotation-bids',
    component: QuotationBidsComponent,
  },
  {
    path: 'quotation-bids/:quotationId',
    component: QuotationBidsComponent,
  },
  {
    path: 'confirm-quotation',
    component: ConfirmQuotationComponent,
  },
  {
    path: 'magic-link-sent',
    component: MagicLinkSentComponent,
  },
  {
    path: 'confirm-club-registration',
    component: ConfirmClubRegistrationComponent,
  },
  {
    path: 'confirm-quotation/:quotationId',
    component: ConfirmQuotationComponent,
  },
  {
    path: 'article-detail/:entity',
    component: SymbolDetailComponent,
  },
  {
    path: 'items-slides-editor-2',
    component: ItemsSlidesEditorComponent,
  },
  {
    path: 'items-slides-editor-2/:itemId',
    component: ItemsSlidesEditorComponent,
  },
  {
    path: 'slides-editor-2/:articleId',
    component: QrEditComponent,
  },
  {
    path: 'slides-editor-2',
    component: QrEditComponent,
  },
  {
    path: 'ambassador-store',
    component: AmbassadorStoreComponent,
  },
  // TODO: Change this
  {
    path: 'provider-items',
    component: ProviderItemsComponent,
  },
  {
    path: 'club-landing',
    component: ClubLandingComponent,
  },
  {
    path: 'proflora-campaign',
    component: ProfloraCampainComponent,
  },
  {
    path: 'daliah-chat',
    component: DaliahChatComponent
  },
  {
    path: 'daliah-training',
    component: DaliaTrainingComponent
  },
  {
    path: ':merchantSlug',
    component: EcommerceComponent,
    children: [
      {
        path: 'category-items/:categoryId',
        component: CategoryItemsComponent,
      },
      {
        path: 'store',
        component: StoreComponent,
        children: [
          {
            path: '',
            component: AllItemsComponent,
          },
          {
            path: 'categories/:tagId',
            component: TagItemsComponent,
          },
        ],
      },
      {
        path: 'create-article',
        component: CreateArticleComponent,
      },
      {
        path: 'post-slide-editor',
        component: PostsSlidesEditorComponent,
      },
      {
        path: 'article-detail/:entity/:entityId',
        component: SymbolDetailComponent,
      },
      {
        path: 'article-detail/:entity',
        component: SymbolDetailComponent,
      },
      {
        path: 'order-info/:id',
        component: OrderDetailComponent,
      },
      {
        path: 'payments-redirection',
        component: PaymentsRedirectionComponent,
      },
      {
        path: 'new-address',
        component: NewAddressComponent,
      },
      {
        path: 'create-giftcard',
        component: CreateGiftcardComponent,
      },
      {
        path: 'reservations/:calendarId',
        component: ReservationsComponent,
      },
      {
        path: 'checkout',
        component: CheckoutComponent,
      },
      {
        path: 'cart',
        component: CartComponent,
      },
      {
        path: 'receiver-form',
        component: ReceiverFormComponent,
      },
      {
        path: 'payments/:orderId',
        component: PaymentsComponent,
      },
      {
        path: 'payments',
        component: PaymentsComponent,
      },
      {
        path: 'image-banner',
        component: ImageBannerComponent,
      },
      {
        path: 'text-edition-and-preview',
        component: TextEditionAndPreviewComponent,
      },
      {
        path: 'collections',
        component: CollectionsComponent,
      },
      {
        path: 'collections/:tagId',
        component: TagItemsComponent,
      },
      // {
      //   path: 'categories',
      //   component: CollectionsComponent,
      // },
      // {
      //   path: 'categories/:tagId',
      //   component: TagItemsComponent,
      // },
      {
        path: 'store-assistant',
        component: StoreAssistantComponent,
      },
      {
        path: 'order-process/:orderId',
        component: OrderProcessComponent,
      },
      {
        path: 'terms-of-use/:viewsMerchantId',
        component: TermsOfUseComponent,
      },
      {
        path: 'post-edition',
        component: PostEditionComponent,
      },
      {
        path: 'post-preview',
        component: PostPreviewComponent,
      },
      {
        path: 'qr-edit',
        component: QrEditComponent,
      },
      {
        path: 'webform/:itemId',
        component: WebformClientViewComponent,
      },
      {
        path: 'new-symbol',
        component: NewSymbolComponent,
      },
      {
        path: 'giftcard-details',
        component: GiftcardDetailsComponent,
      },
      {
        path: 'chat-merchant',
        component: ChatRoomComponent,
      },
      {
        path: 'chat-merchant/:chatId',
        component: ChatRoomComponent,
      },
      {
        path: 'daliah-training',
        component: DaliaTrainingComponent
      }
    ],
  },

];

@NgModule({
  declarations: [
    EcommerceComponent,
    CategoryItemsComponent,
    StoreComponent,
    CreateGiftcardComponent,
    OrderDetailComponent,
    RedirectionsComponent,
    HeavenlyBalloonsComponent,
    LlStudioOrderFormComponent,
    NewAddressComponent,
    CheckoutComponent,
    PaymentsComponent,
    ReservationsComponent,
    PaymentsRedirectionComponent,
    ArticleAccessComponent,
    ArticleDetailComponent,
    CreateArticleComponent,
    TermsOfUseComponent,
    CollectionsComponent,
    TagItemsComponent,
    GiftDetailComponent,
    MerchantLandingComponent,
    StoreAssistantComponent,
    RegistroKioskoComponent,
    KioskoViewComponent,
    LinksPageComponent,
    LinkRegisterComponent,
    LinkUpdateComponent,
    MyContactRegisterComponent,
    PostEditionComponent,
    Fase1LandingComponent,
    ArticleUploadComponent,
    TextEditionAndPreviewComponent,
    AllItemsComponent,
    CartComponent,
    ReceiverFormComponent,
    NewSymbolComponent,
    GiftcardDetailsComponent,
    AmbassadorStoreComponent,
    SymbolDetailComponent,
    OrderConfirmationComponent,
    InvalidMagicLinkComponent,
    QuotationBidsComponent,
    InventoryCreatorComponent,
    ConfirmQuotationComponent,
    ItemCreationComponent,
    ProviderItemsComponent,
    ClubLandingComponent,
    ConfirmClubRegistrationComponent,
    MagicLinkSentComponent,
    MerchantRegisterComponent,
    LoginLandingComponent,
    NotificationAccessScreenComponent,
    ProfloraCampainComponent,
    ChatRoomComponent,
    DaliahChatComponent,
    DaliaTrainingComponent,
  ],
  imports: [
    CommonModule,
    SharedModule,
    AppointmentsModule,
    AdminModule,
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
export class EcommerceModule { }
