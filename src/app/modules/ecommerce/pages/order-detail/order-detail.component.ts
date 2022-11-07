import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { LocationStrategy } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { formatID } from 'src/app/core/helpers/strings.helpers';
import { NgNavigatorShareService } from 'ng-navigator-share';
import { CustomizerValue } from 'src/app/core/models/customizer-value';
import { ItemOrder, OrderStatusNameType } from 'src/app/core/models/order';
import { Post, PostInput } from 'src/app/core/models/post';
import { User } from 'src/app/core/models/user';
import { Tag } from 'src/app/core/models/tags';
import { MerchantsService } from 'src/app/core/services/merchants.service';
import { CustomizerValueService } from 'src/app/core/services/customizer-value.service';
import { TagsService } from 'src/app/core/services/tags.service';
import { OrderService } from 'src/app/core/services/order.service';
import { PostsService } from 'src/app/core/services/posts.service';
import { ReservationService } from 'src/app/core/services/reservations.service';
import { AuthService } from 'src/app/core/services/auth.service';
import { HeaderService } from 'src/app/core/services/header.service';
import { DialogService } from 'src/app/libs/dialog/services/dialog.service';
import { TagAsignationComponent } from 'src/app/shared/dialogs/tag-asignation/tag-asignation.component';
import { StoreShareComponent } from 'src/app/shared/dialogs/store-share/store-share.component';
import { ImageViewComponent } from 'src/app/shared/dialogs/image-view/image-view.component';
import { environment } from 'src/environments/environment';
import * as moment from 'moment';
import { SaleFlowService } from 'src/app/core/services/saleflow.service';
import { PaginationInput, SaleFlow } from 'src/app/core/models/saleflow';
import { Merchant } from 'src/app/core/models/merchant';

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
  notify: boolean;
  currentDayOrdersRange: {
    fromISO: string;
    toISO: string;
  } = null;
  ordersInTheSameDay: ItemOrder[] = [];
  customizerDetails: { name: string; value: string }[] = [];
  customizer: CustomizerValue;
  order: ItemOrder;
  post: Post;
  payment: number;
  merchant: boolean;
  orderStatus: OrderStatusNameType;
  orderDate: string;
  date: {
    month: string;
    day: number;
    weekday: string;
    time: string;
  };
  messageLink: string;
  loggedUser: User;
  tags: Tag[];
  selectedTags: any = {};
  tabs: any[] = ['', '', '', '', ''];
  imageList: Image[] = [
    {
      src: '/bookmark-checked.svg',
      filter: 'brightness(2)',
      callback: async () => {
        const tags = (await this.tagsService.tagsByUser()) || [];
        for (const tag of tags) {
          this.selectedTags[tag._id] = false;
          if (this.order.tags.includes(tag._id)) {
            this.selectedTags[tag._id] = true;
          }
        }
        this.tags = tags;
        this.tagDialog();
      },
    },
    {
      src: '/QR.svg',
      filter: 'brightness(7)',
      callback: () => {
        this.downloadQr();
      },
    },
    {
      src: '/upload.svg',
      filter: 'brightness(2)',
      callback: async () => {
        await this.ngNavigatorShareService.share({
          title: `Mi orden`,
          url: `${this.URI}/ecommerce/order-detail/${this.order.items[0].saleflow.headline}`,
        });
      },
    },
  ];
  orderSaleflow: SaleFlow;
  orderMerchant: Merchant;
  orderInDayIndex: number = null;

  @ViewChild('qrcode', { read: ElementRef }) qr: ElementRef;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private orderService: OrderService,
    private dialogService: DialogService,
    private postsService: PostsService,
    private customizerValueService: CustomizerValueService,
    private reservationService: ReservationService,
    private location: LocationStrategy,
    private authService: AuthService,
    public headerService: HeaderService,
    private ngNavigatorShareService: NgNavigatorShareService,
    private merchantsService: MerchantsService,
    private tagsService: TagsService,
    private saleflowService: SaleFlowService
  ) {
    history.pushState(null, null, window.location.href);
    this.location.onPopState(() => {
      history.pushState(null, null, window.location.href);
    });
  }

  async ngOnInit(): Promise<void> {
    this.route.queryParams.subscribe(async (queryParams) => {
      const { notify: notification } = queryParams;

      this.route.params.subscribe(async (params) => {
        const { orderId } = params;

        await this.executeProcessesAfterLoading(orderId, notification);
      });
    });
  }

  async executeProcessesAfterLoading(orderId: string, notification?: string) {
    this.order = (await this.orderService.order(orderId))?.order;

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
    this.checkUser();
    await this.isMerchantOwner(this.order.items[0].saleflow.merchant._id);

    if (this.order.items[0].post) {
      this.post = (
        await this.postsService.getPost(this.order.items[0].post._id)
      ).post;
    }
    if (this.order.items[0].customizer) {
      this.payment =
        Math.round((this.payment * 1.18 + Number.EPSILON) * 100) / 100;
      this.customizer = await this.customizerValueService.getCustomizerValue(
        this.order.items[0].customizer._id
      );
      const printType = this.order.items[0].item.params[0].values.find(
        (value) => value._id === this.order.items[0].params[0].paramValue
      )?.name;
      if (printType)
        this.customizerDetails.push({
          name: 'Tipo de impresión',
          value: printType,
        });

      const selectedQuality = this.order.items[0].item.params[1].values.find(
        (value) => value._id === this.order.items[0].params[1].paramValue
      )?.name;
      if (selectedQuality)
        this.customizerDetails.push({
          name: 'Calidad de servilleta',
          value: selectedQuality,
        });

      const backgroundColor = this.customizer.backgroundColor.color.name;
      if (backgroundColor)
        this.customizerDetails.push({
          name: 'Color de fondo',
          value: backgroundColor,
        });

      if (this.customizer.texts.length) {
        this.customizerDetails.push({
          name: 'Texto',
          value: this.customizer.texts.reduce(
            (prev, curr) => prev + curr.text,
            ''
          ),
        });
      }

      let selectedTypography =
        this.customizer.texts.length > 0 && this.customizer.texts[0].font;
      switch (selectedTypography) {
        case 'Dorsa':
          selectedTypography = 'Empire';
          break;
        case 'Commercial-Script':
          selectedTypography = 'Classic';
          break;
      }
      if (selectedTypography)
        this.customizerDetails.push({
          name: 'Nombre de tipografía',
          value: selectedTypography,
        });

      const typographyColorCode =
        this.customizer.texts.length && this.customizer.texts[0].color.name;
      const typographyColorName =
        this.customizer.texts.length && this.customizer.texts[0].color.nickname;
      if (typographyColorCode && typographyColorName) {
        this.customizerDetails.push({
          name: 'Color de tipografía',
          value: typographyColorName,
        });
        this.customizerDetails.push({
          name: 'Código de color de tipografía',
          value: typographyColorCode,
        });
      }

      const stickerColorCode =
        this.customizer.stickers.length &&
        this.customizer.stickers[0].svgOptions.color.name;
      const stickerColorName =
        this.customizer.stickers.length &&
        this.customizer.stickers[0].svgOptions.color.nickname;
      if (stickerColorName) {
        this.customizerDetails.push({
          name: 'Color de sticker',
          value: stickerColorName,
        });
        this.customizerDetails.push({
          name: 'Código de color de sticker',
          value: stickerColorCode,
        });
      }

      this.order.items[0].item.images[0] = this.customizer.preview;
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

      let customizerMessage = '';
      if (this.order.items[0].customizer) {
        const customizer = await this.customizerValueService.getCustomizerValue(
          this.order.items[0].customizer._id
        );
        const printType = this.order.items[0].item.params[0].values.find(
          (value) => value._id === this.order.items[0].params[0].paramValue
        )?.name;
        if (printType)
          customizerMessage += 'Tipo de impresión: ' + printType + '\n';

        const selectedQuality = this.order.items[0].item.params[1].values.find(
          (value) => value._id === this.order.items[0].params[1].paramValue
        )?.name;
        if (selectedQuality)
          customizerMessage +=
            'Calidad de servilleta: ' + selectedQuality + '\n';

        const backgroundColor = customizer.backgroundColor.color.name;
        if (backgroundColor)
          customizerMessage += 'Color de fondo: ' + backgroundColor + '\n';

        if (customizer.texts.length) {
          customizerMessage +=
            'Texto: ' +
            customizer.texts.reduce((prev, curr) => prev + curr.text, '') +
            '\n';

          let selectedTypography = customizer.texts[0].font;
          switch (selectedTypography) {
            case 'Dorsa':
              selectedTypography = 'Empire';
              break;
            case 'Commercial-Script':
              selectedTypography = 'Classic';
              break;
          }
          customizerMessage +=
            'Nombre de tipografía: ' + selectedTypography + '\n';

          const typographyColorCode = customizer.texts[0].color.name;
          const typographyColorName = customizer.texts[0].color.nickname;
          customizerMessage +=
            'Color de tipografía: ' + typographyColorName + '\n';
          customizerMessage +=
            'Código de color de tipografía: ' + typographyColorCode + '\n';
        }

        if (customizer.stickers.length) {
          const stickerColorCode = customizer.stickers[0].svgOptions.color.name;
          const stickerColorName =
            customizer.stickers[0].svgOptions.color.nickname;
          customizerMessage += 'Color de sticker: ' + stickerColorName + '\n';
          customizerMessage +=
            'Código de color de sticker: ' + stickerColorCode;
        }
      }

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
      }${customizerMessage ? '\n\nCustomizer:\n' + customizerMessage : ''}`;

      this.messageLink = `https://api.whatsapp.com/send?phone=${
        this.order.items[0].saleflow.merchant.owner.phone
      }&text=${encodeURIComponent(message)}`;
      this.notify = true;
    }

    const today = new Date(this.order.createdAt);
    const utcOffset = today.getTimezoneOffset() / 60;
    const todayFromISO = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate()
    ).toISOString();

    this.currentDayOrdersRange = {
      fromISO: moment(todayFromISO)
        .subtract(utcOffset, 'hours')
        .toDate()
        .toISOString(),
      toISO: moment(todayFromISO)
        .subtract(utcOffset, 'hours')
        .add(23, 'hours')
        .add(59, 'minutes')
        .add(59, 'seconds')
        .toDate()
        .toISOString(),
    };

    await this.getAdjacentOrders();
  }

  async getAdjacentOrders(
    getOrdersFromTheNextDay = false,
    getOrdersFromThePreviousDay = false
  ) {
    let closestOrderDayBeforeCurrentOrderCreationDate = null;
    let closestOrderDayAfterCurrentOrderCreationDate = null;

    //I SHOULD MOVE ON FROM HERE
    /*
    if(getOrdersFromThePreviousDay) {
      const pagination: PaginationInput = {
        options: {
          range: {
            from: 
          },
          limit: -1,
        },
      };
  
      const { ordersByMerchant: ordersInTheSameDay } =
        await this.merchantsService.ordersByMerchant(
          this.orderMerchant._id,
          pagination
        );
    }

    if (getOrdersFromThePreviousDay) {
      this.currentDayOrdersRange = {
        fromISO: moment(closestOrderDayBeforeCurrentOrderCreationDate)
          .subtract(1, 'day')
          .toDate()
          .toISOString(),
        toISO: moment(closestOrderDayBeforeCurrentOrderCreationDate)
          .subtract(1, 'day')
          .add(23, 'hours')
          .add(59, 'minutes')
          .add(59, 'seconds')
          .toDate()
          .toISOString(),
      };
    }

    if (getOrdersFromTheNextDay) {
      this.currentDayOrdersRange = {
        fromISO: moment(closestOrderDayAfterCurrentOrderCreationDate)
          .add(1, 'day')
          .toDate()
          .toISOString(),
        toISO: moment(closestOrderDayAfterCurrentOrderCreationDate)
          .add(1, 'day')
          .add(23, 'hours')
          .add(59, 'minutes')
          .add(59, 'seconds')
          .toDate()
          .toISOString(),
      };
    }*/

    let from = this.currentDayOrdersRange.fromISO;
    let to = this.currentDayOrdersRange.toISO;
    const range = {
      from: from,
      to: to,
    };

    const pagination: PaginationInput = {
      options: {
        range,
        limit: -1,
      },
    };

    const { ordersByMerchant: ordersInTheSameDay } =
      await this.merchantsService.ordersByMerchant(
        this.orderMerchant._id,
        pagination
      );

    if (
      ordersInTheSameDay &&
      !getOrdersFromTheNextDay &&
      !getOrdersFromThePreviousDay
    ) {
      this.ordersInTheSameDay = ordersInTheSameDay;

      const orderIndex = this.ordersInTheSameDay.findIndex(
        (order) => order._id === this.order._id
      );

      if (orderIndex >= 0) {
        this.orderInDayIndex = orderIndex;
      }
    }

    if (ordersInTheSameDay && getOrdersFromThePreviousDay) {
      this.orderInDayIndex = ordersInTheSameDay.length - 1;

      this.executeProcessesAfterLoading(
        this.ordersInTheSameDay[this.orderInDayIndex]._id
      );
    }

    if (ordersInTheSameDay && getOrdersFromTheNextDay) {
      this.orderInDayIndex = 0;

      this.executeProcessesAfterLoading(
        this.ordersInTheSameDay[this.orderInDayIndex]._id
      );
    }
  }

  goToNextOrPreviousOrder(direction: 'NEXT' | 'PREVIOUS') {
    if (
      this.orderInDayIndex < this.ordersInTheSameDay.length - 1 &&
      direction === 'NEXT'
    ) {
      this.executeProcessesAfterLoading(
        this.ordersInTheSameDay[this.orderInDayIndex + 1]._id
      );
    }

    if (this.orderInDayIndex > 0 && direction === 'PREVIOUS') {
      this.executeProcessesAfterLoading(
        this.ordersInTheSameDay[this.orderInDayIndex - 1]._id
      );
    }

    if (this.orderInDayIndex === 0 && direction === 'PREVIOUS') {
      this.getAdjacentOrders(false, true);
    }

    if (
      this.orderInDayIndex === this.ordersInTheSameDay.length - 1 &&
      direction === 'NEXT'
    ) {
      this.getAdjacentOrders(true, false);
    }
  }

  notificationClicked() {
    this.notify = false;
    this.router.navigate([], {
      relativeTo: this.route,
    });
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
        buttonCallback: () => {
          this.authService.signoutThree();
        },
      },
      customClass: 'app-dialog',
      flags: ['no-header'],
    });
  }

  tagDialog() {
    this.dialogService.open(TagAsignationComponent, {
      type: 'fullscreen-translucent',
      customClass: 'app-dialog',
      flags: ['no-header'],
      props: {
        text: 'SALVAR TAGS SELECCIOANDOS EN LA ORDEN',
        tags: this.tags,
        orderId: this.order._id,
        activeTags:
          this.order.tags &&
          (this.order.tags !== null ||
            (undefined && this.order.tags.length > 0))
            ? this.order.tags
            : null,
        tagAction: async (param) => {
          // !this.selectedTags[param._id] ? this.selectedTags[param._id] = true : this.selectedTags[param._id] = false;
          this.addTag(param._id);
        },
      },
    });
  }

  async addTag(tagId?: string) {
    if (!this.selectedTags[tagId]) {
      const added = await this.tagsService.addTagsInOrder(
        this.order.items[0].saleflow.merchant._id,
        tagId,
        this.order._id
      );
      this.selectedTags[tagId] = true;
      this.order.tags.push(tagId);
    } else {
      const removed = await this.tagsService.removeTagsInOrder(
        this.order.items[0].saleflow.merchant._id,
        tagId,
        this.order._id
      );
      console.log(removed);
      this.selectedTags[tagId] = false;
      if (this.order.tags.includes(tagId)) {
        this.order.tags = this.order.tags.filter((tag) => tag !== tagId);
      }
      console.log(this.order.tags);
    }
  }

  downloadQr() {
    const parentElement = this.qr.nativeElement.querySelector('img').src;
    let blobData = this.convertBase64ToBlob(parentElement);
    if (window.navigator && (window.navigator as any).msSaveOrOpenBlob) {
      //IE
      (window.navigator as any).msSaveOrOpenBlob(blobData, 'Qrcode');
    } else {
      // chrome
      const blob = new Blob([blobData], { type: 'image/png' });
      const url = window.URL.createObjectURL(blob);
      // window.open(url);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'Qrcode';
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
      this.order.user?.name || this.order.user?.phone || this.order.user?.email
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

  formatId(dateId: string) {
    return formatID(dateId);
  }

  redirectToUserContact = () => {
    this.router.navigate([
      `/others/user-contact-landing/${this.order.user._id}`,
    ]);
  };

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
      [`../../${this.order.items[0].saleflow._id}/checkout`],
      {
        relativeTo: this.route,
      }
    );
  }

  async checkUser() {
    const user = await this.authService.me();
    if (user) this.loggedUser = user;
    else return;
  }

  async isMerchantOwner(merchant: string) {
    const ismerchant = await this.merchantsService.merchantDefault();
    this.merchant = merchant === ismerchant?._id;
    if (ismerchant) this.orderMerchant = ismerchant;
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
}
