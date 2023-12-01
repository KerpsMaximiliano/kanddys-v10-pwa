import { LocationStrategy } from '@angular/common';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgNavigatorShareService } from 'ng-navigator-share';
import {
  capitalize,
  formatID,
  isVideo,
  truncateString,
} from 'src/app/core/helpers/strings.helpers';
import { Merchant } from 'src/app/core/models/merchant';
import {
  ItemOrder,
  OrderStatusDeliveryType,
  OrderStatusNameType,
} from 'src/app/core/models/order';
import { Post, PostInput, Slide } from 'src/app/core/models/post';
import { SaleFlow } from 'src/app/core/models/saleflow';
import { Tag, TagInput } from 'src/app/core/models/tags';
import { AuthService } from 'src/app/core/services/auth.service';
import { HeaderService } from 'src/app/core/services/header.service';
import { MerchantsService } from 'src/app/core/services/merchants.service';
import { OrderService } from 'src/app/core/services/order.service';
import { PaymentLogsService } from 'src/app/core/services/paymentLogs.service';
import { PostsService } from 'src/app/core/services/posts.service';
import { ReservationService } from 'src/app/core/services/reservations.service';
import { TagsService } from 'src/app/core/services/tags.service';
import { DialogService } from 'src/app/libs/dialog/services/dialog.service';
import { ImageViewComponent } from 'src/app/shared/dialogs/image-view/image-view.component';
import { StoreShareComponent } from 'src/app/shared/dialogs/store-share/store-share.component';
import { environment } from 'src/environments/environment';
import { playVideoOnFullscreen } from 'src/app/core/helpers/ui.helpers';
import { EntityTemplateService } from 'src/app/core/services/entity-template.service';
import { EntityTemplate } from 'src/app/core/models/entity-template';
import { Clipboard } from '@angular/cdk/clipboard';
import { ToastrService } from 'ngx-toastr';
import { lockUI, unlockUI } from 'src/app/core/helpers/ui.helpers';
import { MatDialog } from '@angular/material/dialog';
import { CreateTagComponent } from 'src/app/shared/dialogs/create-tag/create-tag.component';
import { DropdownOptionItem } from 'src/app/shared/components/dropdown-menu/dropdown-menu.component';
import {
  AnswersQuestion,
  Question,
  Webform,
  WebformAnswer,
} from 'src/app/core/models/webform';
import { WebformsService } from 'src/app/core/services/webforms.service';
import { answerByOrder } from 'src/app/core/graphql/webforms.gql';
import { DeliveryZone } from 'src/app/core/models/deliveryzone';
import { Reservation } from 'src/app/core/models/reservation';
import { DeliveryZonesService } from 'src/app/core/services/deliveryzones.service';
import { DomSanitizer } from '@angular/platform-browser';
import { ContactService } from 'src/app/core/services/contact.service';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { OptionsMenuComponent } from 'src/app/shared/dialogs/options-menu/options-menu.component';
import { ContactHeaderComponent } from 'src/app/shared/components/contact-header/contact-header.component';
import * as moment from 'moment';
import { OverlayDialogComponent } from 'src/app/shared/dialogs/overlay-dialog/overlay-dialog.component';
import { Chat } from 'src/app/core/models/chat';
import { User } from 'src/app/core/models/user';
import { base64ToBlob } from 'src/app/core/helpers/files.helpers';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ProgressDialogComponent } from 'src/app/shared/dialogs/progress-dialog/progress-dialog.component';

interface ExtendedChat extends Chat {
  receiver?: User;
  receiverId?: string;
}
interface Image {
  src: string;
  filter?: string;
  callback?(...param): any;
}

interface Image {
  src: string;
  filter?: string;
  callback?(...param): any;
}

interface ExtendedSlide extends Slide {
  isVideo?: boolean;
}

interface ExtendedWebformAnswer extends WebformAnswer {
  questionLabel: string;
}

@Component({
  selector: 'app-order-detail',
  templateUrl: './order-detail.component.html',
  styleUrls: ['./order-detail.component.scss'],
})
export class OrderDetailComponent implements OnInit {
  env: string = environment.assetsUrl;
  URI: string = environment.uri;
  order: ItemOrder;
  orderId;
  post: Post;
  slides: ExtendedSlide[];
  payment: number;
  deliveryAmount: number;
  paymentFeeAmount: number;
  itemsAmount: number;
  isMerchant: boolean;
  benefits: {
    benefits: number;
    less: number;
    percentageBenefits: number;
    percentageLess: number;
  };
  orderStatus;
  orderDate: string;
  paymentType: string;
  date: {
    month: string;
    day: number;
    weekday: string;
    time: string;
  };
  messageLink: string;
  tags: Tag[];
  selectedTags: {
    [key: string]: boolean;
  } = {};
  selectedTagsLength: number;
  redirectTo: string = null;
  orderMerchant: Merchant;
  orderInDayIndex: number = null;
  // buyerView: boolean = true;
  infoCardBg: string = '#E9E371';
  payedWithAzul: boolean;
  imageFiles: string[] = ['image/png', 'image/jpg', 'image/jpeg'];
  videoFiles: string[] = [
    'video/mp4',
    'video/webm',
    'video/m4v',
    'video/avi',
    'video/mpg',
    'video/mpeg',
    'video/mpeg4',
    'video/mov',
    'video/3gp',
    'video/mxf',
    'video/m2ts',
    'video/m2ts',
  ];
  playVideoOnFullscreen = playVideoOnFullscreen;
  entityTemplate: EntityTemplate;
  entityTemplateLink: string;
  notify: boolean = false;
  orderDeliveryStatus = this.orderService.orderDeliveryStatusUpperCaseSpanish;
  questionsForAnswers: Record<string, Question> = {};

  // deliveryStatusOptions: DropdownOptionItem[] = [
  //   {
  //     text: 'En preparación',
  //     value: 'in progress',
  //     selected: false,
  //     hide: false,
  //   },
  // ];
  tagOptions: DropdownOptionItem[];
  tagPanelState: boolean;
  webformsByItem: Record<string, Webform> = {};
  answersByItem: Record<string, WebformAnswer> = {};
  answersByItemDropdownOpened: Record<string, boolean> = {};
  from: string;
  navigationWithMessage: string;
  deliveryImages: {
    image?: string;
    deliveryZone?: DeliveryZone;
    reservation?: Reservation;
  };
  link: string;
  chatLink: string;
  panelOpenState = false;
  openNavigation = false;

  statusList: Array<{
    name: string;
    status?:string;
  }> = [];
  activeStatusIndex = 0;

  capitalize = capitalize;
  truncateString = truncateString;

  @ViewChild('qrcode', { read: ElementRef }) qr: ElementRef;
  @ViewChild('qrcodeTemplate', { read: ElementRef }) qrcodeTemplate: ElementRef;

  // statusList: OrderStatusDeliveryType[] = [
  //   'in progress',
  //   'pending',
  //   'pickup',
  //   'shipped',
  //   'delivered',
  // ];

  showOverlay = false;
  merchantSlug: string;
  merchant: string;
  merchantName: string;
  merchantEmail: string;
  merchanNameIsUser: string = '';
  qrdata: string = `${this.URI}${this.router.url}`;
  @ViewChild('qrcode', { read: ElementRef }) qrcode: ElementRef;
  countOrders: number = 0
  user: string = '';
  address: string = '';
  orderDelivery: string = '';
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private orderService: OrderService,
    private dialogService: DialogService,
    private postsService: PostsService,
    private reservationService: ReservationService,
    private location: LocationStrategy,
    private authService: AuthService,
    public headerService: HeaderService,
    private merchantsService: MerchantsService,
    private paymentLogService: PaymentLogsService,
    private entityTemplateService: EntityTemplateService,
    private clipboard: Clipboard,
    private toastr: ToastrService,
    private tagsService: TagsService,
    public dialog: MatDialog,
    private webformsService: WebformsService,
    private deliveryzoneService: DeliveryZonesService,
    public _DomSanitizer: DomSanitizer,
    private contactService: ContactService,
    private _bottomSheet: MatBottomSheet,
    private NgNavigatorShareService: NgNavigatorShareService,
    private snackBar: MatSnackBar,
  ) {
    history.pushState(null, null, window.location.href);
    this.location.onPopState(() => {
      history.pushState(null, null, window.location.href);
    });
  }

  headerData: any;
  async ngOnInit(): Promise<void> {
    // this.route.queryParams.subscribe(async (queryParams) => {
    //   const {
    //     notify: notification,
    //     redirectTo,
    //     from,
    //     navigationWithMessage,
    //   } = queryParams;
    //   console.log("queryParams", queryParams)
    //   this.notify = Boolean(notification);
    //   this.redirectTo = redirectTo;
    //   this.from = from;
    //   this.navigationWithMessage = navigationWithMessage;

    //   if (typeof redirectTo === 'undefined') this.redirectTo = null;

    //   this.route.params.subscribe(async (params) => {
    //     const { orderId } = params;
    //     this.orderId = orderId;
    //     await this.executeProcessesAfterLoading(orderId, notification);
    //   });
    // });
    this.route.params.subscribe(async (params) => {
      const { orderId } = params;
      this.orderId = orderId;
      this.order = (await this.orderService.order(orderId, false))?.order;
      console.log("this.order", this.order)
      
      // DIRECCIÓN //
      if(!this.order?.items[0]?.deliveryLocation?.street){
        this.address = `${this.order?.items[0]?.deliveryLocation?.nickName}, República Dominicana`
      }else{
        let house = this.order?.items[0]?.deliveryLocation?.houseNumber ? "#" + this.order?.items[0]?.deliveryLocation?.houseNumber + ", " : "";
        let street = this.order?.items[0]?.deliveryLocation?.street + ", ";
        let referencePoint = this.order?.items[0]?.deliveryLocation?.referencePoint ? this.order?.items[0]?.deliveryLocation?.referencePoint + ", " : "";
        let city = this.order?.items[0]?.deliveryLocation?.city + ", República Dominicana"
        this.address = house + street + referencePoint + city;
      }
      
      await this.executeProcessesAfterLoadingW(this.order)
      
    });
    
  }
  
  async getMerchantDefault() {
    try {
      const merchantDefault: Merchant = await this.merchantsService.merchantDefault();
      this.merchant = merchantDefault._id;
      this.merchantSlug = merchantDefault.slug;
      this.merchantName = merchantDefault.name;
      this.merchantEmail = merchantDefault.email;
    } catch (error) {
      console.error('error');
    }
  }

  async toggleOverlay() {
    let merchant = this.order?.items[0].saleflow.merchant?.name.length < 14 ? this.order?.items[0].saleflow.merchant?.name : this.order?.items[0].saleflow.merchant?.name.slice(0, 14) + "...";
    
    this._bottomSheet.open(OverlayDialogComponent, {
      data: {
        title: `¡Gracias por tu compra ${this.user.length < 10 ? this.user : (this.user.slice(0, 10) + "...")}!`,
        text1: `Recuerda que tu pedido llega el ${this.displayReservationW(this.deliveryImages?.reservation)}`,
        buttons: [
          {
            value: `Comunícate con ${await this.capitalizeWords(merchant)}`,
            class: {
              background: 'linear-gradient(92deg, #6BC8A7 18.84%, #6A9EB8 93.01%)',
              fontSize: '17px',
              fontFamily: 'InterSemiBold',
              color: '#181D17',
              border: '0px'
            },
            callback: async () => {
              this.showAlert(1)
            },
          },{
            value: `Compartir`,
            callback: () => {
              this.showAlert(2)
            },
          }
          
        ],
        showActive: true
      },
    });
  }

  async capitalizeWords(sentence: string) {
    return sentence.split(' ').map(function(word) {
      return word.charAt(0).toUpperCase() + word.slice(1);
    }).join(' ');
  }

  async showAlert(option: number){
    if(option == 1){
      this.goToChatDetail();
    }else{
      this.shareDialog()
    }
  }

  shareDialog() {
    this._bottomSheet.open(OptionsMenuComponent, {
      data: {
        title: 'Comparte el Enlace de la Tienda:',
        options: [
          {
            value: 'Copia',
            callback: () => {
              this.clipboard.copy(this.qrdata);
              this.snackBar.open('Enlace copiado', 'Cerrar', {
                duration: 3000,
              });
            },
          },
          {
            value: 'Comparte',
            callback: () => {
              this.NgNavigatorShareService.share({
                title: 'Compartir enlace de www.flores.club',
                url: `${this.qrdata}`,
              });
            },
          },
          {
            value: 'Descarga el QR',
            callback: () => {
              this.downloadQr();
            },
          },
        ],
      },
    });
  }

  downloadQr() {
    const parentElement = this.qrcode.nativeElement.querySelector('img').src;
    let blobData = base64ToBlob(parentElement);
    if (window.navigator && (window.navigator as any).msSaveOrOpenBlob) {
      (window.navigator as any).msSaveOrOpenBlob(blobData, 'Landing QR Code');
    } else {
      const blob = new Blob([blobData], { type: 'image/png' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = "Landing QR Code";
      link.click();
    }
  }
  async goToChatDetail() {
    this.router.navigate(
      [
        `ecommerce/${this.order.items[0].saleflow.merchant.slug}/chat-merchant`
      ],
      {
        queryParams: {
          fromStore: true,
        },
      }
    );
  }
  
  getPricePart(price: number, part: 'main' | 'decimal'): string | number {
    if(!price)
      return '';
    const parts = price.toString().split('.');
    if (parts.length === 2 && (part === 'main' || part === 'decimal')) {
      return part === 'main' ? parts[0] : parts[1];
    }
    
    return part == 'decimal' ?  '' : price;
  }
  totalProducts: number = 0;
  async executeProcessesAfterLoadingW(order: ItemOrder){
    // USUARIO //
    this.user = this.order.user.name || this.order.user.email || this.order.user.phone
    const user = this.headerService.user;
    console.log("user", user)

    let deliveryZone: DeliveryZone;
    let reservation: Reservation;
    if (this.order.deliveryZone) {
      deliveryZone = await this.deliveryzoneService.deliveryZone(
        this.order.deliveryZone
      );
    }

    if (this.order.items[0].reservation) {
      reservation = await this.reservationService.getReservation(
        this.order.items[0].reservation._id
      );
    }

    this.deliveryImages = {
      image: this.order.deliveryData?.image
        ? this.order.deliveryData.image
        : null,
      deliveryZone: deliveryZone ? deliveryZone : null,
      reservation: reservation ? reservation : null,
    };

    // VERIFICAMOS PARA MOSTRAR EL OVERLAY DE AGRADECIMIENTO //
    if(this.headerService.user)
      if(this.headerService.user._id == this.order.user._id)
        setTimeout(() => {
          this.toggleOverlay() 
        }, 100);

    this.buildStatusList();
    await this.isMerchantOwner(this.order);
    // CANTIDAD DE ÓRDENES //
    this.countOrders = this.order.items?.length;
    // TOTALES DE PRODUCTOS // 
    this.itemsAmount = this.order.subtotals.reduce((a, b) => (b?.type === 'item' ? a + b.amount : a), 0);
    // TOTAL ENVÍO // 
    this.deliveryAmount = this.order.subtotals.reduce((a, b) => (b?.type === 'delivery' ? a + b.amount : a), 0);
    // TOTAL FEE //
    this.paymentFeeAmount = this.order.subtotals.reduce((a, b) => (b?.type === 'fee-payment-method' ? a + b.amount : a), 0);// TOTALES //
    
    this.payment = this.order.subtotals.reduce((a, b) => a + b.amount, 0);
    
    if (order.items) {
      for (const itemSubOrder of order.items) {
        itemSubOrder.item.media = itemSubOrder.item.images
          .sort(({ index: a }, { index: b }) => (a > b ? 1 : -1))
          .map((image) => {
            let url = image.value;
            const fileParts = image.value.split('.');
            const fileExtension = fileParts[fileParts.length - 1].toLowerCase();
            let auxiliarImageFileExtension = 'image/' + fileExtension;
            let auxiliarVideoFileExtension = 'video/' + fileExtension;

            if (url && !url.includes('http') && !url.includes('https')) {
              url = 'https://' + url;
            }

            if (this.imageFiles.includes(auxiliarImageFileExtension)) {
              return {
                src: url,
                type: 'IMAGE',
              };
            } else if (this.videoFiles.includes(auxiliarVideoFileExtension)) {
              return {
                src: url,
                type: 'VIDEO',
              };
            }
          });
      }
    }
    
    this.orderStatus = this.orderService.getOrderStatusNameUpperCase(
      this.order.orderStatus
    );

    // FECHA //
    moment.locale('es')
    this.orderDate = moment(this.order.createdAt).format("DD [de] MMMM" )
    
    // MÉTODO DE PAGO // 
    this.paymentType = (this.order.ocr) ? this.getPaymentMethodName(this.order.ocr?.platform) : null;
    
    
  }
  // ======================================================================================== //
  async executeProcessesAfterLoading(orderId: string, notification?: string) {
    this.order = (await this.orderService.order(orderId, false))?.order;
    await this.isMerchantOwner(this.order);
    this.buildStatusList();

    await this.getAnswersForEachItem();

    if (!this.order) {
      this.router.navigate([`others/error-screen/`], {
        queryParams: { type: 'order' },
      });
      return;
    }
    this.headerService.fetchSaleflow(this.order.items[0].saleflow._id);
    if (this.order.items) {
      for (const itemSubOrder of this.order.items) {
        itemSubOrder.item.media = itemSubOrder.item.images
          .sort(({ index: a }, { index: b }) => (a > b ? 1 : -1))
          .map((image) => {
            let url = image.value;
            const fileParts = image.value.split('.');
            const fileExtension = fileParts[fileParts.length - 1].toLowerCase();
            let auxiliarImageFileExtension = 'image/' + fileExtension;
            let auxiliarVideoFileExtension = 'video/' + fileExtension;

            if (url && !url.includes('http') && !url.includes('https')) {
              url = 'https://' + url;
            }

            if (this.imageFiles.includes(auxiliarImageFileExtension)) {
              return {
                src: url,
                type: 'IMAGE',
              };
            } else if (this.videoFiles.includes(auxiliarVideoFileExtension)) {
              return {
                src: url,
                type: 'VIDEO',
              };
            }
          });
      }

      const fullLink = `${environment.uri}/ecommerce/order-detail/${this.order._id}`;

      const message = `*🐝 FACTURA ${formatID(
        this.order.dateId
      )}* \n\nLink de lo facturado por: ${fullLink}`;

      this.link = `${this.URI}/ecommerce/contact-landing/${this.order?.items[0].saleflow.merchant.owner._id}`;
      this.chatLink = `https://api.whatsapp.com/send?phone=${
        this.order.items[0].saleflow.merchant.owner.phone
      }&text=${encodeURIComponent(message)}`;
    }

    this.itemsAmount = this.order.subtotals.reduce(
      (a, b) => (b?.type === 'item' ? a + b.amount : a),
      0
    );
    this.deliveryAmount = this.order.subtotals.reduce(
      (a, b) => (b?.type === 'delivery' ? a + b.amount : a),
      0
    );
    this.paymentFeeAmount = this.order.subtotals.reduce(
      (a, b) => (b?.type === 'fee-payment-method' ? a + b.amount : a),
      0
    );
    this.payment = this.order.subtotals.reduce((a, b) => a + b.amount, 0);
    // if (this.order.orderStatus === 'draft') return unlockUI();


    const paymentLog = await this.paymentLogService.paymentLogsByOrder({
      findBy: {
        order: this.order._id,
      },
    });
      
    if (paymentLog && paymentLog.length > 0 && paymentLog[0].paymentMethod === 'azul')
      this.payedWithAzul = true;
    else {
    this.paymentType =
      (paymentLog && paymentLog.length > 0) ? 
        this.getPaymentMethodName(paymentLog[0].paymentMethod) :
        null;
    }

    this.orderStatus = this.orderService.getOrderStatusName(
      this.order.orderStatus
    );
    this.orderDate = moment(this.order.createdAt).format("DD MMM YYYY, h:mm:ss a" )

    if (!this.headerService.merchantContact) {
      this.headerService.merchantContact = (
        await this.contactService.contacts({
          findBy: {
            user: this.order.items[0].saleflow.merchant.owner._id,
          },
          options: {
            limit: 1,
            sortBy: 'createdAt:desc',
          },
        })
      )[0];
    }

    if (this.order.items[0].post) {
      this.post = (
        await this.postsService.getPost(this.order.items[0].post._id)
      ).post;
      this.slides = await this.postsService.slidesByPost(this.post._id);

      for (const slide of this.slides) {
        if (slide.type === 'poster' && isVideo(slide.media)) {
          slide.isVideo = true;

          if (
            !slide.media.includes('https://') &&
            !slide.media.includes('http://')
          ) {
            slide.media = 'https://' + slide.media;
          }
        }
      }

      if (this.post) {
        const results = await this.entityTemplateService.entityTemplates({
          findBy: {
            reference: this.post._id,
          },
        });

        this.entityTemplateLink =
          this.URI +
          '/ecommerce/' +
          this.order.items[0].saleflow.merchant.slug +
          '/article-detail/post/' +
          this.post._id;

        if (results.length > 0) {
          this.entityTemplate = results[0];

          console.log("Results", results);

          this.entityTemplateLink =
            this.entityTemplate.access === 'public' ||
            this.entityTemplate.recipients === 0
              ? this.URI + '/qr/article-template/' + this.entityTemplate._id
              : this.URI +
                '/ecommerce/article-access/' +
                this.entityTemplate._id;
        }
      }
    }
    // if (this.order.items[0].reservation) {
    //   const reservation = await this.reservationService.getReservation(
    //     this.order.items[0].reservation._id
    //   );
    //   if (reservation) {
    //     const fromDate = new Date(reservation.date.from);
    //     const untilDate = new Date(reservation.date.until);
    //     this.date = {
    //       day: fromDate.getDate(),
    //       weekday: fromDate.toLocaleString('es-MX', {
    //         weekday: 'short',
    //       }),
    //       month: fromDate.toLocaleString('es-MX', {
    //         month: 'short',
    //       }),
    //       time: `De ${this.formatHour(fromDate)} a ${this.formatHour(
    //         untilDate,
    //         reservation.breakTime
    //       )}`,
    //     };
    //   }
    // }
    let deliveryZone: DeliveryZone;
    let reservation: Reservation;
    if (this.order.deliveryZone) {
      deliveryZone = await this.deliveryzoneService.deliveryZone(
        this.order.deliveryZone
      );
    }

    if (this.order.items[0].reservation) {
      reservation = await this.reservationService.getReservation(
        this.order.items[0].reservation._id
      );
    }

    this.deliveryImages = {
      image: this.order.deliveryData?.image
        ? this.order.deliveryData.image
        : null,
      deliveryZone: deliveryZone ? deliveryZone : null,
      reservation: reservation ? reservation : null,
    };

    let address = '';
    const location = this.order.items[0].deliveryLocation;
    if (location) {
      address = '\n\nDirección: ';
      if (location.street) {
        // this.deliveryStatusOptions.push(
        //   {
        //     text: 'Listo para enviarse',
        //     value: 'pending',
        //     selected: false,
        //     hide: false,
        //   },
        //   {
        //     text: 'De camino a ser entregado',
        //     value: 'shipped',
        //     selected: false,
        //     hide: false,
        //   }
        // );
        if (location.houseNumber) address += '#' + location.houseNumber + ', ';
        address += location.street + ', ';
        if (location.referencePoint) address += location.referencePoint + ', ';
        address += location.city + ', República Dominicana';
        if (location.note) address += ` (${location.note})`;
      } else {
        address += location.nickName;
        // this.deliveryStatusOptions.push({
        //   text: 'Listo para pick-up',
        //   value: 'pickup',
        //   selected: false,
        //   hide: false,
        // });
      }
    }
    // this.deliveryStatusOptions.push({
    //   text: 'Entregado',
    //   value: 'delivered',
    //   selected: false,
    //   hide: false,
    // });
    // if (this.isMerchant) {
    //   this.handleStatusOptions(this.order.orderStatusDelivery);
    // }

    let giftMessage = '';
    if (this.post?.from) giftMessage += 'De: ' + this.post.from + '\n';
    if (this.post?.targets?.[0]?.name)
      giftMessage += 'Para: ' + this.post.targets[0].name + '\n';
    if (this.post?.message) giftMessage += 'Mensaje: ' + this.post.message;

    const fullLink = `${environment.uri}/ecommerce/order-detail/${this.order._id}`;
    const message = `*🐝 FACTURA ${formatID(
      this.order.dateId
    )}* \n\nLink de lo facturado por $${this.payment.toLocaleString(
      'es-MX'
    )}: ${fullLink}\n\n*Comprador*: ${
      this.order.user?.name ||
      this.order.user?.phone ||
      this.order.user?.email ||
      'Anónimo'
    }${address}\n\n${
      giftMessage
        ? '\n\nMensaje en la tarjetita de regalo: \n' + giftMessage
        : ''
    }`;

    const phone =
      this.order.items[0].saleflow.merchant.receiveNotificationsMainPhone ?
      this.order.items[0].saleflow.merchant.owner.phone :
      this.order.items[0].saleflow.merchant.secondaryContacts.length > 0 ?
      this.order.items[0].saleflow.merchant.secondaryContacts[0] :
      `19188156444`;

    this.messageLink = `https://api.whatsapp.com/send?phone=${
      phone
    }&text=${encodeURIComponent(message)}`;
    const tags =
      (await this.tagsService.tagsByUser({
        findBy: {
          entity: 'order',
        },
        options: {
          limit: -1,
        },
      })) || [];
    for (const tag of tags) {
      this.selectedTags[tag._id] = this.order.tags.includes(tag._id);
    }
    this.selectedTagsLength = Object.entries(this.selectedTags).filter(
      (value) => value[1]
    ).length;
    this.tags = tags;
    this.tagOptions = this.tags.map((tag) => {
      return {
        text: tag.name,
        value: tag._id,
        selected: this.order.tags.includes(tag._id),
      };
    });
    this.benefits = await this.orderService.orderBenefits(this.order._id);
  }

  goToWhatsapp() {
    window.location.href = this.messageLink;
  }

  // async notificationClicked() {
  //   this.notify = false;
  //   this.router.navigate([], {
  //     relativeTo: this.route,
  //   });
  //   const tags =
  //     (await this.tagsService.tagsByUser({
  //       findBy: {
  //         entity: 'order',
  //       },
  //       options: {
  //         limit: -1,
  //       },
  //     })) || [];
  //   for (const tag of tags) {
  //     this.selectedTags[tag._id] = false;
  //     if (this.order.tags.includes(tag._id)) {
  //       this.selectedTags[tag._id] = true;
  //     }
  //   }
  //   this.tags = tags;
  //   this.isMerchantOwner(this.order.items[0].saleflow.merchant._id);
  // }

  openImageModal(imageSourceURL: string) {
    this.dialogService.open(ImageViewComponent, {
      type: 'fullscreen-translucent',
      props: {
        imageSourceURL,
      },
      customClass: 'app-dialog',
      flags: ['no-header'],
    });
  }

  formatId(dateId: string) {
    return formatID(dateId);
  }

  redirectToUserContact = () => {
    this.router.navigate([
      `/others/user-contact-landing/${this.order.user._id}`,
    ]);
  };

  redirectFromQueryParams() {
    if (this.from.includes('?')) {
      const redirectURL: { url: string; queryParams: Record<string, string> } =
        { url: null, queryParams: {} };
      const routeParts = this.from.split('?');
      const redirectionURL = routeParts[0];
      const routeQueryStrings = routeParts[1].split('&').map((queryString) => {
        const queryStringElements = queryString.split('=');

        return {
          [queryStringElements[0]]: queryStringElements[1].replace('%20', ' '),
        };
      });

      redirectURL.url = redirectionURL;
      redirectURL.queryParams = {};

      routeQueryStrings.forEach((queryString) => {
        const key = Object.keys(queryString)[0];
        redirectURL.queryParams[key] = queryString[key];
      });

      this.router.navigate([redirectURL.url], {
        queryParams: redirectURL.queryParams,
        replaceUrl: true,
      });
    } else {
      this.router.navigate([this.from], {
        replaceUrl: true,
      });
    }
  }

  // async changeOrderStatus(value: OrderStatusDeliveryType) {
  //   this.order.orderStatusDelivery = value;
  //   this.handleStatusOptions(value);
  //   await this.orderService.orderSetStatusDelivery(value, this.order._id);
  // }

  // handleStatusOptions(value: OrderStatusDeliveryType) {
  //   this.deliveryStatusOptions.forEach((option) => {
  //     option.hide = option.value === value;
  //   });
  // }

  goToStore() {
    let link = this.order.items[0].saleflow.merchant.slug;
    this.router.navigate([`../${link}/store`], {
      relativeTo: this.route,
    });
  }

  goToPost() {
    this.router.navigate([
      '/qr/' + '/article-template/' + this.entityTemplate._id,
    ]);
  }

  goToBenefits() {
    return this.router.navigate(
      [`/admin/order-expenses/${this.order._id}`],
      {
        queryParams: {
          redirectTo: this.router.url,
        }
      }
    );
  }

  async addTag(tagId: string) {
    if (!this.selectedTags[tagId]) {
      await this.tagsService.addTagsInOrder(
        this.order.items[0].saleflow.merchant._id,
        tagId,
        this.order._id
      );
      this.selectedTags[tagId] = true;
      this.order.tags.push(tagId);
    } else {
      await this.tagsService.removeTagsInOrder(
        this.order.items[0].saleflow.merchant._id,
        tagId,
        this.order._id
      );
      this.selectedTags[tagId] = false;
      this.order.tags = this.order.tags.filter((tag) => tag !== tagId);
    }
    this.selectedTagsLength = Object.entries(this.selectedTags).filter(
      (value) => value[1]
    ).length;
  }

  async downloadQr2(qrElment: ElementRef) {
    const parentElement = qrElment.nativeElement.querySelector('img').src;
    let blobData = this.convertBase64ToBlob(parentElement);
    if (window.navigator && (window.navigator as any).msSaveOrOpenBlob) {
      //IE
      (window.navigator as any).msSaveOrOpenBlob(
        blobData,
        this.formatId(this.order.dateId)
      );
    } else {
      // chrome
      const blob = new Blob([blobData], { type: 'image/png' });
      const url = window.URL.createObjectURL(blob);
      // window.open(url);
      const link = document.createElement('a');
      link.href = url;
      link.download = await this.formatId(this.order.dateId);
      link.click();
    }
  }

  private convertBase64ToBlob(Base64Image: string) {
    // SPLIT INTO TWO PARTS
    const parts = Base64Image.split(';base64,');
    // HOLD THE CONTENT TYPE
    const imageType = parts[0].split(':')[1];
    // DECODE BASE64 STRING
    const decodedData = window.atob(parts[1]);
    // CREATE UNIT8ARRAY OF SIZE SAME AS ROW DATA LENGTH
    const uInt8Array = new Uint8Array(decodedData.length);
    // INSERT ALL CHARACTER CODE INTO UINT8ARRAY
    for (let i = 0; i < decodedData.length; ++i) {
      uInt8Array[i] = decodedData.charCodeAt(i);
    }
    // RETURN BLOB IMAGE AFTER CONVERSION
    return new Blob([uInt8Array], { type: imageType });
  }

  sendMessage() {
    const fullLink = `${environment.uri}/ecommerce/order-detail/${this.order._id}`;
    const message = `*🐝 FACTURA ${formatID(
      this.order.dateId
    )}* \n\nLink de lo facturado por $${this.payment.toLocaleString(
      'es-MX'
    )}: ${fullLink}`;

    this.messageLink = `https://api.whatsapp.com/send?phone=${
      this.order.user?.phone
    }&text=${encodeURIComponent(message)}`;
    window.location.href = this.messageLink;
  }

  formatHour(date: Date, breakTime?: number) {
    if (breakTime) date = new Date(date.getTime() - breakTime * 60000);

    let result = date.toLocaleTimeString([], {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });

    if (result.startsWith('0:')) {
      result = result.replace('0:', '12:');
    }

    return result;
  }

  async buyAgain() {
    this.headerService.deleteSaleflowOrder();
    this.headerService.order = {
      products: this.order.items.map((item) => {
        // if (item.params?.length) {
        //   const paramItem = item.item.params[0].values.find(
        //     (itemParam) => itemParam._id === item.params[0].paramValue
        //   );
        //   this.headerService.storeItem(paramItem);
        // } else this.headerService.storeItem(item.item);
        return {
          amount: item.amount,
          item: item.item._id,
          params: item.params,
        };
      }),
    };
    const deliveryLocation = this.order.items[0].deliveryLocation;
    this.headerService.storeLocation(deliveryLocation);
    this.headerService.order.products[0] = {
      ...this.headerService.order.products[0],
      saleflow: this.order.items[0].saleflow._id,
      deliveryLocation,
    };
    this.headerService.storeOrder(this.headerService.order);
    this.headerService.orderProgress.delivery = true;
    const postInput: PostInput = {
      message: this.post?.message || '',
      targets: [
        {
          name: this.post?.targets?.[0]?.name || '',
          emailOrPhone: '',
        },
      ],
      from: this.post?.from || '',
      socialNetworks: [
        {
          url: '',
        },
      ],
    };
    this.headerService.post = postInput;
    this.headerService.storePost(postInput);
    this.headerService.orderProgress.message = true;
    this.headerService.storeOrderProgress();

    this.router.navigate(
      [`../../${this.headerService.saleflow.merchant.slug}/checkout`],
      {
        relativeTo: this.route,
      }
    );
  }

  async isMerchantOwner(order: ItemOrder) {
    const merchants = order.merchants;
    const orderMerchant = await this.merchantsService.merchantDefault();
    console.log("orderMerchant", orderMerchant)
    this.isMerchant = merchants.filter(merchant => merchant._id === orderMerchant?._id).length > 0;
    return this.isMerchant;
  }

  async handleStatusUpdated(updatedStatus: string) {
    const status = this.statusList.map(a => a.status);
    this.activeStatusIndex = status.findIndex(
      (status) => status === updatedStatus
    );
    this.openNotificationDialog()
  }

  openEmail() {
    (document.querySelector('#mailLink') as HTMLElement).click();
  }

  openNotificationDialog() {
    const link = `${environment.uri}/ecommerce/order-detail/${this.order._id}`;
    if (this.order.user.email && this.order.user.phone) {
      this._bottomSheet.open(OptionsMenuComponent, {
        data: {
          title: `¿Notificar del nuevo Status a ${this.order.user.name || this.order.user.email || this.order.user.phone}?`,
          options: [
            {
              value: `Copia el enlace de la factura`,
              callback: () => {
                this.clipboard.copy(link);
              },
            },
            {
              value: `Comparte el enlace de la factura`,
              callback: () => {
                this.NgNavigatorShareService.share({
                  title: '',
                  url: link,
                });
              },
            },
            {
              value: `Compártecelo por Whatsapp`,
              callback: () => {
                this.goToWhatsapp()
              },
            },
            {
              value: `Compártecelo por correo electronico`,
              callback: () => {
                this.openEmail();
              },
            },
          ],
          styles: {
            fullScreen: true,
          },
        }
      });
    } else if(!this.order.user.email) {
      this._bottomSheet.open(OptionsMenuComponent, {
        data: {
          title: `¿Notificar del nuevo Status a ${this.order.user.name || this.order.user.email || this.order.user.phone}?`,
          options: [
            {
              value: `Copia el enlace de la factura`,
              callback: () => {
                this.clipboard.copy(link);
              },
            },
            {
              value: `Comparte el enlace de la factura`,
              callback: () => {
                this.NgNavigatorShareService.share({
                  title: '',
                  url: link,
                });
              },
            },
            {
              value: `Compártecelo por Whatsapp`,
              callback: () => {
                this.goToWhatsapp()
              },
            },
          ],
          styles: {
            fullScreen: true,
          },
        }
      });
    } else {
      this._bottomSheet.open(OptionsMenuComponent, {
        data: {
          title: `¿Notificar del nuevo Status a ${this.order.user.name || this.order.user.email || this.order.user.phone}?`,
          options: [
            {
              value: `Copia el enlace de la factura`,
              callback: () => {
                this.clipboard.copy(link);
              },
            },
            {
              value: `Comparte el enlace de la factura`,
              callback: () => {
                this.NgNavigatorShareService.share({
                  title: '',
                  url: link,
                });
              },
            },
            {
              value: `Compártecelo por correo electronico`,
              callback: () => {
                this.openEmail();
              },
            },
          ],
          styles: {
            fullScreen: true,
          },
        }
      });
    }
    
  }

  createTag() {
    let dialogRef = this.dialog.open(CreateTagComponent, {
      data: ['Ingresa el nombre del listado', 'Ingresa el cover del listado'],
    });
    dialogRef.afterClosed().subscribe(async (result) => {
      if (!result) return;
      const data: TagInput = {
        name: result.name,
        entity: 'order',
        images: result.images,
        merchant: this.orderMerchant._id,
      };
      const createdTag = await this.tagsService.createTag(data);
      this.tagOptions.push({
        text: result.name,
        value: createdTag._id,
        selected: false,
      });
    });
  }

  urlIsVideo(url: string) {
    return isVideo(url);
  }

  mouseDown: boolean;
  startX: number;
  scrollLeft: number;

  startDragging(e: MouseEvent, el: HTMLDivElement) {
    this.mouseDown = true;
    this.startX = e.pageX - el.offsetLeft;
    this.scrollLeft = el.scrollLeft;
  }

  stopDragging() {
    this.mouseDown = false;
  }

  moveEvent(e: MouseEvent, el: HTMLDivElement) {
    e.preventDefault();
    if (!this.mouseDown) {
      return;
    }
    const x = e.pageX - el.offsetLeft;
    const scroll = x - this.startX;
    el.scrollLeft = this.scrollLeft - scroll;
  }

  returnEvent() {
    if (!this.redirectTo && !this.from) return this.returnToStore();

    if (!this.redirectTo && this.from) return this.redirectFromQueryParams();

    let queryParams = {};
    if (this.redirectTo.includes('?')) {
      const url = this.redirectTo.split('?');
      this.redirectTo = url[0];
      const queryParamList = url[1].split('&');
      for (const param in queryParamList) {
        const keyValue = queryParamList[param].split('=');
        queryParams[keyValue[0]] = keyValue[1].replace('%20', ' ');
      }
    }
    this.router.navigate([this.redirectTo], {
      queryParams,
    });
  }

  goToPostDetail() {
    this.downloadQr2(this.qrcodeTemplate);
    /*
    this.headerService.flowRoute = window.location.href
      .split('/')
      .slice(3)
      .join('/');

    localStorage.setItem('flowRoute', this.headerService.flowRoute);

    this.router.navigate([
      '/ecommerce/' +
        this.order.items[0].saleflow.merchant.slug +
        '/article-detail/post/' +
        this.post._id,
    ]);*/
  }

  displayReservation(reservation: Reservation) {
    const fromDate = new Date(reservation.date.from);
    const untilDate = new Date(reservation.date.until);

    const day = fromDate.getDate();
    const weekday = fromDate.toLocaleString('es-MX', {
      weekday: 'short',
    });
    const month = fromDate.toLocaleString('es-MX', {
      month: 'short',
    });
    const time = `De ${this.formatHour(fromDate)} a ${this.formatHour(
      untilDate,
      reservation.breakTime
    )}`;

    return `${weekday}, ${day} de ${month}. ${time}`;
  }

  moveDropdown() {
    document.getElementById('move').classList.add('move');

    setTimeout(function () {
      document.getElementById('move').classList.remove('move');
    }, 3500);
  }

  returnToStore = () => {
    this.router.navigate([
      'ecommerce/' + this.order.items[0].saleflow.merchant.slug + '/store',
    ]);
  };

  copyEntityId(id: string) {
    const entityId = id;

    this.clipboard.copy(entityId);

    this.toastr.info('Id copiado al portapapeles', null, {
      timeOut: 3000,
    });
  }

  async getAnswersForEachItem() {
    this.answersByItem = {};
    const answers: Array<WebformAnswer> =
      await this.webformsService.answerByOrder(this.order._id);

    console.log('AnswersByOrder', answers);
    if (answers?.length) {
      const webformsIds = [];
      for (const item of this.order.items) {
        if (item.item.webForms && item.item.webForms.length) {
          const webform = item.item.webForms[0];
          webformsIds.push(webform.reference);
        }
      }

      const webforms = await this.webformsService.webforms({
        findBy: {
          _id: {
            __in: webformsIds,
          },
        },
        options: {
          limit: -1,
        },
      });

      for (const item of this.order.items) {
        if (item.item.webForms && item.item.webForms.length) {
          const webform = item.item.webForms[0];

          const answersForWebform = answers.find(
            (answerInList) => answerInList.webform === webform.reference
          );

          if (answersForWebform) {
            const webformObject = webforms.find(
              (webformInList) => webformInList._id === webform.reference
            );

            if (webformObject) {
              this.webformsByItem[item._id] = webformObject;

              const questionsToQuery = [];

              answersForWebform.response.forEach((answerInList) => {
                if (answerInList.question)
                  questionsToQuery.push(answerInList.question);
              });

              const questions = await this.webformsService.questionPaginate({
                findBy: {
                  _id: {
                    __in: questionsToQuery,
                  },
                },
              });

              answersForWebform.response.forEach((answerInList) => {
                const question = questions.find(
                  (questionInList) =>
                    questionInList._id === answerInList.question
                );

                if (answerInList.question && question) {
                  answerInList.question = question.value;

                  if (
                    answerInList.value &&
                    ((!answerInList.isMedia &&
                      answerInList.value.startsWith('https')) ||
                      answerInList.value.startsWith('http'))
                  )
                    answerInList.isMedia = true;
                } else {
                  answerInList.question = null;
                }
              });
            }

            this.answersByItem[item._id] = answersForWebform;
            this.answersByItemDropdownOpened[item._id] = false;
          }
        }
      }
    }
  }

  openContactInfo() {
    const { phone, email } = this.headerService.saleflow?.merchant.owner;
    this._bottomSheet.open(ContactHeaderComponent, {
      data: {
        link: `${this.URI}${this.router.url}`,
        bio: this.headerService.saleflow?.merchant.bio,
        contact: this.headerService.merchantContact,
        phone,
        email,
      },
    });
  }

  buildStatusList() {    
    const statusList: OrderStatusDeliveryType[] = ['in progress', 'delivered'];

    const location = this.order.items[0].deliveryLocation;

    if (location.street) {
      statusList.splice(1, 0, 'pending');
      statusList.splice(2, 0, 'shipped');
    } else statusList.splice(1, 0, 'pickup');

    for (const status of statusList) {
      this.statusList.push({
        name: this.orderService.orderDeliveryStatusUpperCaseSpanish(status),
        status: status
      });
    }

    const /* The above code is declaring a variable named "orderStatuDelivery" in TypeScript. */
    orderStatuDelivery = this.order.orderStatusDelivery;
    this.activeStatusIndex = statusList.findIndex(
      (status) => status === orderStatuDelivery
    );
    this.orderDelivery = this.statusList[this.activeStatusIndex].name
   }

  private getPaymentMethodName(paymentMethod: string): string {
    switch (paymentMethod) {
      case 'azul':
        return 'Azul';
      case 'stripe':
        return 'Tarjeta de crédito';
      case 'paypal':
        return 'PayPal';
      case 'cash':
        return 'Efectivo';
      case 'bank-transfer':
        return 'Transferencia';
      default:
        return '';
    }
  }

  progress(){
    // this.activeStatusIndex = 3;
    let val = (this.activeStatusIndex == this.statusList.length - 1) ? true: false; 
    let fecha = this.order.dateId?.split("N")
    this._bottomSheet.open(ProgressDialogComponent, {
      data: {
        title: '',
        state: this.orderStatus,
        description: `Tu pedido llegará el ${this.displayReservationW(this.deliveryImages?.reservation)} en la dirección ${this.address}`,
        statusList: this.statusList,
        activeIndex: this.activeStatusIndex,
        isAdmin: this.isMerchant,
        orderId: this.orderId,
        valOrderFinish: val,
        buttons: [
          {
            value: 'Volver a comprar',
            callback: (event) => {
              this.handleStatusUpdated_(event)
            },
          },
        ],
        changeStatus: {
          callback: (event) => {
            this.handleStatusUpdated(event)
          },
        },
      },
    });
  }
  async handleStatusUpdated_(event: any){

  }

  displayReservationW(reservation: Reservation) {
    const fromDate = new Date(reservation.date.from);
    const untilDate = new Date(reservation.date.until);
  
    const day = fromDate.getDate();
    const weekday = fromDate.toLocaleString('es-MX', {
      weekday: 'long',
    }).replace(/^\w/, (c) => c.toUpperCase());
    const month = fromDate.toLocaleString('es-MX', {
      month: 'long',
    }).replace(/^\w/, (c) => c.toUpperCase()); 
    const time = `entre ${this.formatHour(fromDate)} - ${this.formatHour(
      untilDate,
      reservation.breakTime
    )}`
    // .replace('/a\. m\./g', 'am').replace(/p\. m\./g, 'pm');
  
    return `${weekday} ${day} de ${month} ${time}`;
  }

  getValidImageUrl(images: any[]): string {
    const validExtensions = ['png', 'jpg', 'jpeg'];
    const defaultImageUrl = '/assets/images/noimage.png';
  
    if (images && images.length > 0) {
      for (const image of images) {
        const extension = image.value.split('.').pop()?.toLowerCase();
        if (validExtensions.includes(extension)) {
          return 'url(' + image.value + ')';
        }
      }
    }
  
    return 'url(' + defaultImageUrl + ')';
  }
}
