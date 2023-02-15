import { LocationStrategy } from '@angular/common';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgNavigatorShareService } from 'ng-navigator-share';
import { formatID, isVideo } from 'src/app/core/helpers/strings.helpers';
import { Merchant } from 'src/app/core/models/merchant';
import {
  ItemOrder,
  OrderStatusDeliveryType,
  OrderStatusNameType,
} from 'src/app/core/models/order';
import { Post, PostInput, Slide } from 'src/app/core/models/post';
import { SaleFlow } from 'src/app/core/models/saleflow';
import { Tag } from 'src/app/core/models/tags';
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

@Component({
  selector: 'app-order-detail',
  templateUrl: './order-detail.component.html',
  styleUrls: ['./order-detail.component.scss'],
})
export class OrderDetailComponent implements OnInit {
  env: string = environment.assetsUrl;
  URI: string = environment.uri;
  ordersInTheSameDay: ItemOrder[] = [];
  orderBeforeOrderDay: ItemOrder = null;
  orderAfterOrderDay: ItemOrder = null;
  order: ItemOrder;
  post: Post;
  slides: Slide[];
  payment: number;
  isMerchant: boolean;
  merchantOwner: boolean;
  // changeColor: string;
  orderStatus: OrderStatusNameType;
  orderDate: string;
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
  redirectTo: string = null;
  orderSaleflow: SaleFlow;
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
  dropdownList = [
    { text: 'Option 1', selected: false },
    { text: 'Option 2', selected: false },
    { text: 'Option 3', selected: false },
  ];
  playVideoOnFullscreen = playVideoOnFullscreen;
  notify: boolean = false;

  deliveryStatusOptions = [
    { text: 'Pick Up', value: 'pickup', selected: false },
    { text: 'Todo listo para entregarse', value: 'pending', selected: false },
    { text: 'De camino a ser entregado', value: 'shipped', selected: false },
    { text: 'Entregado', value: 'delivered', selected: false },
  ];
  tagOptions: {
    text: string;
    value: string;
    selected: boolean;
  }[];

  @ViewChild('qrcode', { read: ElementRef }) qr: ElementRef;

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
    private ngNavigatorShareService: NgNavigatorShareService,
    private merchantsService: MerchantsService,
    private paymentLogService: PaymentLogsService,
    private tagsService: TagsService
  ) {
    history.pushState(null, null, window.location.href);
    this.location.onPopState(() => {
      history.pushState(null, null, window.location.href);
    });
  }

  async ngOnInit(): Promise<void> {
    this.route.queryParams.subscribe(async (queryParams) => {
      const { notify: notification, redirectTo } = queryParams;
      this.notify = Boolean(notification);
      this.redirectTo = redirectTo;

      if (typeof redirectTo === 'undefined') this.redirectTo = null;

      this.route.params.subscribe(async (params) => {
        const { orderId } = params;

        await this.executeProcessesAfterLoading(orderId, notification);
      });
    });

    // this.isMerchant = true;
    // this.orderMerchant._id;
    // console.log(this.orderMerchant._id);
  }

  async executeProcessesAfterLoading(orderId: string, notification?: string) {
    // const tagsAsignationOnStart = this.route.snapshot.queryParamMap.get(
    //   'tagsAsignationOnStart'
    // );

    // if (tagsAsignationOnStart) this.tagsAsignationOnStart = true;

    this.order = (await this.orderService.order(orderId))?.order;

    if (this.order.items) {
      for (const itemSubOrder of this.order.items) {
        itemSubOrder.item.media = itemSubOrder.item.images.map((image) => {
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

    if (!this.order.ocr) {
      const result = await this.paymentLogService.paymentLogsByOrder({
        findBy: {
          order: this.order._id,
        },
      });

      if (result && result.length > 0 && result[0].paymentMethod === 'azul') {
        this.payedWithAzul = true;
      }
    }

    if (!this.order) {
      this.router.navigate([`others/error-screen/`], {
        queryParams: { type: 'order' },
      });
      return;
    }
    this.payment = this.order.subtotals.reduce((a, b) => a + b.amount, 0);
    this.orderStatus = this.orderService.getOrderStatusName(
      this.order.orderStatus
    );
    const temporalDate = new Date(this.order.createdAt);
    this.orderDate = temporalDate
      .toLocaleString('es-MX', {
        hour12: true,
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
      .toLocaleUpperCase();
    this.headerService.user = await this.authService.me();
    await this.isMerchantOwner(this.order.items[0].saleflow.merchant._id);

    if (this.order.items[0].post) {
      this.post = (
        await this.postsService.getPost(this.order.items[0].post._id)
      ).post;
      this.slides = await this.postsService.slidesByPost(this.post._id);
    }
    if (this.order.items[0].reservation) {
      const reservation = await this.reservationService.getReservation(
        this.order.items[0].reservation._id
      );
      if (reservation) {
        const fromDate = new Date(reservation.date.from);
        const untilDate = new Date(reservation.date.until);
        this.date = {
          day: fromDate.getDate(),
          weekday: fromDate.toLocaleString('es-MX', {
            weekday: 'short',
          }),
          month: fromDate.toLocaleString('es-MX', {
            month: 'short',
          }),
          time: `De ${this.formatHour(fromDate)} a ${this.formatHour(
            untilDate,
            reservation.breakTime
          )}`,
        };
      }
    }
    if (notification == 'true') {
      let address = '';
      const location = this.order.items[0].deliveryLocation;
      if (location) {
        address = '\n\nDirección: ';
        if (location.street) {
          if (location.houseNumber)
            address += '#' + location.houseNumber + ', ';
          address += location.street + ', ';
          if (location.referencePoint)
            address += location.referencePoint + ', ';
          address += location.city + ', República Dominicana';
          if (location.note) address += ` (${location.note})`;
        } else {
          address += location.nickName;
        }
      }

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

      this.messageLink = `https://api.whatsapp.com/send?phone=${
        this.order.items[0].saleflow.merchant.owner.phone
      }&text=${encodeURIComponent(message)}`;
      // this.notify = true;
    }

    const today = new Date(this.order.createdAt);
    const utcOffset = today.getTimezoneOffset() / 60;
    const todayFromISO = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate()
    ).toISOString();

    // this.currentDayOrdersRange = {
    //   fromISO: moment(todayFromISO)
    //     .subtract(utcOffset, 'hours')
    //     .toDate()
    //     .toISOString(),
    //   toISO: moment(todayFromISO)
    //     .subtract(utcOffset, 'hours')
    //     .add(23, 'hours')
    //     .add(59, 'minutes')
    //     .add(59, 'seconds')
    //     .toDate()
    //     .toISOString(),
    // };

    // if (this.orderMerchant) await this.getAdjacentOrders();
    // if (this.tagsAsignationOnStart) await this.tagDialog();
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
    this.tags = tags;
    this.tagOptions = this.tags.map((tag) => {
      return {
        text: tag.name,
        value: tag._id,
        selected: this.order.tags.includes(tag._id),
      };
    });
  }

  // async getAdjacentOrders() {
  //   //Get the 1st order before current day
  //   let pagination: PaginationInput = {
  //     options: {
  //       range: {
  //         to: this.currentDayOrdersRange.fromISO,
  //       },
  //       sortBy: 'createdAt:desc',
  //       limit: 1,
  //     },
  //   };

  //   const { ordersByMerchant: orderBeforeOrderDay } =
  //     await this.merchantsService.ordersByMerchant(
  //       this.orderMerchant._id,
  //       pagination
  //     );

  //   if (orderBeforeOrderDay && orderBeforeOrderDay.length > 0) {
  //     this.orderBeforeOrderDay = orderBeforeOrderDay[0];
  //   } else {
  //     this.orderBeforeOrderDay = null;
  //   }

  //   //Get the 1st after current day
  //   pagination = {
  //     options: {
  //       range: {
  //         from: moment(this.currentDayOrdersRange.fromISO)
  //           .add(1, 'days')
  //           .toDate()
  //           .toISOString(),
  //       },
  //       sortBy: 'createdAt:asc',
  //       limit: 1,
  //     },
  //   };

  //   const { ordersByMerchant: orderAfterOrderDay } =
  //     await this.merchantsService.ordersByMerchant(
  //       this.orderMerchant._id,
  //       pagination
  //     );

  //   if (orderAfterOrderDay && orderAfterOrderDay.length > 0) {
  //     this.orderAfterOrderDay = orderAfterOrderDay[0];
  //   } else {
  //     this.orderAfterOrderDay = null;
  //   }

  //   //get orders from the same day
  //   let from = this.currentDayOrdersRange.fromISO;
  //   let to = this.currentDayOrdersRange.toISO;

  //   const range = {
  //     from: from,
  //     to: to,
  //   };

  //   pagination = {
  //     options: {
  //       range,
  //       limit: -1,
  //     },
  //   };

  //   const { ordersByMerchant: ordersInTheSameDay } =
  //     await this.merchantsService.ordersByMerchant(
  //       this.orderMerchant._id,
  //       pagination
  //     );

  //   if (ordersInTheSameDay) {
  //     this.ordersInTheSameDay = ordersInTheSameDay;

  //     const orderIndex = this.ordersInTheSameDay.findIndex(
  //       (order) => order._id === this.order._id
  //     );

  //     if (orderIndex >= 0) {
  //       this.orderInDayIndex = orderIndex;
  //     }
  //   }
  // }

  // goToNextOrPreviousOrder(direction: 'NEXT' | 'PREVIOUS') {
  //   if (
  //     this.orderInDayIndex < this.ordersInTheSameDay.length - 1 &&
  //     direction === 'NEXT'
  //   ) {
  //     history.pushState(
  //       null,
  //       null,
  //       'ecommerce/order-detail/' +
  //         this.ordersInTheSameDay[this.orderInDayIndex + 1]._id
  //     );

  //     this.executeProcessesAfterLoading(
  //       this.ordersInTheSameDay[this.orderInDayIndex + 1]._id
  //     );
  //   }

  //   if (this.orderInDayIndex > 0 && direction === 'PREVIOUS') {
  //     history.pushState(
  //       null,
  //       null,
  //       'ecommerce/order-detail/' +
  //         this.ordersInTheSameDay[this.orderInDayIndex - 1]._id
  //     );

  //     this.executeProcessesAfterLoading(
  //       this.ordersInTheSameDay[this.orderInDayIndex - 1]._id
  //     );
  //   }

  //   if (
  //     this.orderInDayIndex === 0 &&
  //     direction === 'PREVIOUS' &&
  //     this.orderBeforeOrderDay
  //   ) {
  //     history.pushState(
  //       null,
  //       null,
  //       'ecommerce/order-detail/' + this.orderBeforeOrderDay._id
  //     );

  //     this.executeProcessesAfterLoading(this.orderBeforeOrderDay._id);
  //   }

  //   if (
  //     this.orderInDayIndex === this.ordersInTheSameDay.length - 1 &&
  //     direction === 'NEXT' &&
  //     this.orderAfterOrderDay
  //   ) {
  //     history.pushState(
  //       null,
  //       null,
  //       'ecommerce/order-detail/' + this.orderAfterOrderDay._id
  //     );

  //     this.executeProcessesAfterLoading(this.orderAfterOrderDay._id);
  //   }
  // }

  async notificationClicked() {
    this.notify = false;
    this.router.navigate([], {
      relativeTo: this.route,
    });
    console.log(this.order.tags);
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
      this.selectedTags[tag._id] = false;
      if (this.order.tags.includes(tag._id)) {
        this.selectedTags[tag._id] = true;
      }
    }
    this.tags = tags;
    this.isMerchantOwner(this.order.items[0].saleflow.merchant._id);
  }

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

  openLogoutDialog() {
    this.dialogService.open(StoreShareComponent, {
      type: 'fullscreen-translucent',
      props: {
        alternate: true,
        buttonText: 'Cerrar Sesión',
        buttonCallback: async () => {
          await this.authService.signoutThree();
          // this.changeColor = null;
          this.isMerchantOwner(this.order.items[0].saleflow.merchant._id);
        },
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

  async changeOrderStatus(value: OrderStatusDeliveryType) {
    const result = await this.orderService.orderSetStatusDelivery(
      value,
      this.order._id
    );
    this.order.orderStatusDelivery = result.orderStatusDelivery;
  }

  orderDeliveryStatus() {
    return (
      {
        pickup: 'Pick Up',
        pending: 'Todo listo para entregarse',
        shipped: 'De camino a ser entregado',
        delivered: 'Entregado',
      }[this.order?.orderStatusDelivery] || 'Desconocido'
    );
  }

  goToStore() {
    let link = this.order.items[0].saleflow.merchant.slug;
    this.router.navigate([`../${link}/store`], {
      relativeTo: this.route,
    });
  }

  // async tagDialog(tags?: string[]) {
  //   const tagsFilled = await this.tagsService.tagsByUser({
  //     findBy: {
  //       entity: 'order',
  //     },
  //     options: {
  //       limit: -1,
  //     },
  //   });

  //   this.dialogService.open(TagAsignationComponent, {
  //     type: 'fullscreen-translucent',
  //     customClass: 'app-dialog',
  //     flags: ['no-header'],
  //     props: {
  //       text: 'SALVAR TAGS SELECCIOANDOS EN LA ORDEN',
  //       tags: this.tags,
  //       orderId: this.order._id,
  //       activeTags:
  //         this.order.tags &&
  //         (this.order.tags !== null ||
  //           (undefined && this.order.tags.length > 0))
  //           ? this.order.tags
  //           : null,
  //       tagAction: async (param) => {
  //         // !this.selectedTags[param._id] ? this.selectedTags[param._id] = true : this.selectedTags[param._id] = false;
  //         this.addTag(param._id);
  //       },
  //     },
  //   });
  // }

  // settingsDialog() {
  //   const optionsList = [
  //     {
  //       text: 'Compartir',
  //       callback: async () => {
  //         await this.ngNavigatorShareService.share({
  //           title: `Mi orden`,
  //           url: `${this.URI}/ecommerce/order-detail/${this.order._id}`,
  //         });
  //       },
  //     },
  //   ];
  //   if (this.merchantOwner && this.isMerchant) {
  //     optionsList.push({
  //       text: 'Vista del Visitante',
  //       callback: async () => {
  //         this.isMerchant = false;
  //         // this.changeColor = '#272727';
  //       },
  //     });
  //   }
  //   this.dialogService.open(SettingsComponent, {
  //     type: 'fullscreen-translucent',
  //     customClass: 'app-dialog',
  //     flags: ['no-header'],
  //     props: {
  //       title: 'Compartir esta Orden',
  //       optionsList,
  //     },
  //   });
  // }

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
  }

  // downloadQr() {
  //   const parentElement = this.qr.nativeElement.querySelector('img').src;
  //   let blobData = this.convertBase64ToBlob(parentElement);
  //   if (window.navigator && (window.navigator as any).msSaveOrOpenBlob) {
  //     //IE
  //     (window.navigator as any).msSaveOrOpenBlob(
  //       blobData,
  //       this.formatId(this.order.dateId)
  //     );
  //   } else {
  //     // chrome
  //     const blob = new Blob([blobData], { type: 'image/png' });
  //     const url = window.URL.createObjectURL(blob);
  //     // window.open(url);
  //     const link = document.createElement('a');
  //     link.href = url;
  //     link.download = this.formatId(this.order.dateId);
  //     link.click();
  //   }
  // }

  // private convertBase64ToBlob(Base64Image: string) {
  //   // SPLIT INTO TWO PARTS
  //   const parts = Base64Image.split(';base64,');
  //   // HOLD THE CONTENT TYPE
  //   const imageType = parts[0].split(':')[1];
  //   // DECODE BASE64 STRING
  //   const decodedData = window.atob(parts[1]);
  //   // CREATE UNIT8ARRAY OF SIZE SAME AS ROW DATA LENGTH
  //   const uInt8Array = new Uint8Array(decodedData.length);
  //   // INSERT ALL CHARACTER CODE INTO UINT8ARRAY
  //   for (let i = 0; i < decodedData.length; ++i) {
  //     uInt8Array[i] = decodedData.charCodeAt(i);
  //   }
  //   // RETURN BLOB IMAGE AFTER CONVERSION
  //   return new Blob([uInt8Array], { type: imageType });
  // }

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
    window.open(this.messageLink, '_blank');
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
    if (!this.headerService.saleflow)
      await this.headerService.fetchSaleflow(this.order.items[0].saleflow._id);
    this.headerService.deleteSaleflowOrder();
    this.headerService.order = {
      products: this.order.items.map((item) => {
        if (item.params?.length) {
          const paramItem = item.item.params[0].values.find(
            (itemParam) => itemParam._id === item.params[0].paramValue
          );
          this.headerService.storeItem(paramItem);
        } else this.headerService.storeItem(item.item);
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

  changeView = () => {
    // if (this.merchantOwner && !this.isMerchant) {
    //   this.isMerchant = true;
    //   // this.changeColor = '#2874AD';
    // }
  };

  async isMerchantOwner(merchant: string) {
    this.orderMerchant = await this.merchantsService.merchantDefault();
    this.isMerchant = merchant === this.orderMerchant?._id;
    this.merchantOwner = merchant === this.orderMerchant?._id;
    this.headerService.colorTheme = this.isMerchant ? '#2874AD' : '#272727';
  }

  // async addTag(tagId?: string) {
  //   if (!this.selectedTags[tagId]) {
  //     const added = await this.tagsService.addTagsInOrder(
  //       this.order.items[0].saleflow.merchant._id,
  //       tagId,
  //       this.order._id
  //     );
  //     this.selectedTags[tagId] = true;
  //     this.order.tags.push(tagId);
  //   } else {
  //     const removed = await this.tagsService.removeTagsInOrder(
  //       this.order.items[0].saleflow.merchant._id,
  //       tagId,
  //       this.order._id
  //     );
  //     this.selectedTags[tagId] = false;
  //     if (this.order.tags.includes(tagId)) {
  //       this.order.tags = this.order.tags.filter((tag) => tag !== tagId);
  //     }
  //     /* const tagIndex = this.order.tags.findIndex((tag)=>{
  //        tagId === this.order.tags[tag]
  //        console.log(tagId + ' EL ID DEL TAG');
  //     });
  //     console.log(tagIndex + ' INDICE')
  //     if(tagIndex >= 0){
  //        this.order.tags.splice(tagIndex, 1)
  //     } else {
  //        console.log('No Esta')
  //     } */
  //   }
  //   /* let selectedTags = Object.keys(this.selectedTags).filter((tag) =>{
  //     return this.selectedTags[tag] == true
  //  })
  //  console.log(selectedTags);
  //  for await (const tag of selectedTags) {
  //  } */
  // }

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
    this.router.navigate([this.redirectTo]);
  }

  goToPostDetail() {
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
    ]);
  }

  moveDropdown() {
    document.getElementById('move').classList.add('move');

    setTimeout(function () {
      document.getElementById('move').classList.remove('move');
    }, 3500);
  }

  // goBackToFlowRoute() {
  //   if (
  //     this.flowRoute.includes('admin/orders') &&
  //     this.flowRoute &&
  //     this.isMerchant
  //   ) {
  //     this.router.navigate([this.flowRoute], {
  //       queryParams: {
  //         startOnSnapshot: true,
  //       },
  //     });
  //     return;
  //   } else {
  //     if (this.isMerchant && !this.flowRoute.includes('admin/orders')) {
  //       this.router.navigate(['admin/orders']);
  //       return;
  //     }

  //     if (this.flowRoute && !this.isMerchant) {
  //       this.router.navigate([this.flowRoute]);
  //       return;
  //     } else {
  //       this.location.back();
  //       return;
  //     }
  //   }
  // }

  returnToStore = () => {
    this.router.navigate([
      'ecommerce/' + this.order.items[0].saleflow.merchant.slug + '/store',
    ]);
  };
}
