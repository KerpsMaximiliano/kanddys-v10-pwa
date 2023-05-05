import { Clipboard } from '@angular/cdk/clipboard';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DomSanitizer } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { NgNavigatorShareService } from 'ng-navigator-share';
import { SwiperComponent } from 'ngx-swiper-wrapper';
import { base64ToBlob } from 'src/app/core/helpers/files.helpers';
import { formatID, isVideo } from 'src/app/core/helpers/strings.helpers';
import { lockUI, unlockUI } from 'src/app/core/helpers/ui.helpers';
import { Contact } from 'src/app/core/models/contact';
import { DeliveryZone } from 'src/app/core/models/deliveryzone';
import { EntityTemplate } from 'src/app/core/models/entity-template';
import { Merchant } from 'src/app/core/models/merchant';
import { ItemOrder, OrderStatusDeliveryType } from 'src/app/core/models/order';
import { Post, Slide } from 'src/app/core/models/post';
import { Reservation } from 'src/app/core/models/reservation';
import { Tag } from 'src/app/core/models/tags';
import { Webform, WebformAnswer } from 'src/app/core/models/webform';
import { ContactService } from 'src/app/core/services/contact.service';
import { DeliveryZonesService } from 'src/app/core/services/deliveryzones.service';
import { EntityTemplateService } from 'src/app/core/services/entity-template.service';
import { MerchantsService } from 'src/app/core/services/merchants.service';
import { OrderService } from 'src/app/core/services/order.service';
import { PaymentLogsService } from 'src/app/core/services/paymentLogs.service';
import { PostsService } from 'src/app/core/services/posts.service';
import { ReservationService } from 'src/app/core/services/reservations.service';
import { TagsService } from 'src/app/core/services/tags.service';
import { WebformsService } from 'src/app/core/services/webforms.service';
import { DialogService } from 'src/app/libs/dialog/services/dialog.service';
import { ImageViewComponent } from 'src/app/shared/dialogs/image-view/image-view.component';
import { LinksDialogComponent } from 'src/app/shared/dialogs/links-dialog/links-dialog.component';
import { OrderInfoComponent } from 'src/app/shared/dialogs/order-info/order-info.component';
import { environment } from 'src/environments/environment';
import Swiper, { SwiperOptions } from 'swiper';

interface ExtendedItemOrder extends ItemOrder {
  payedWithAzul?: boolean;
  payment?: number;
  benefits?: {
    benefits: number;
    less: number;
    percentageBenefits: number;
    percentageLess: number;
  };
  tagsData?: Tag[];
  paymentType?: string;
  loadedDeliveryStatus?: OrderStatusDeliveryType;
  answersByItem?: Record<string, WebformAnswer>;
  webformsByItem?: Record<string, Webform>;
}

@Component({
  selector: 'app-order-slides',
  templateUrl: './order-slides.component.html',
  styleUrls: ['./order-slides.component.scss'],
})
export class OrderSlidesComponent implements OnInit {
  env: string = environment.assetsUrl;
  URI: string = environment.uri;

  order: ItemOrder;
  ordersToConfirm: ExtendedItemOrder[] = [];
  usersContact: Contact[] = [];
  usersWithoutContact: string[] = [];

  deliveryZone: DeliveryZone;

  orderDeliveryStatus = this.orderService.orderDeliveryStatus;
  formatId = formatID;

  redirectTo: string = null;

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

  // orderStatus: OrderStatusNameType;
  orderDate: string;
  orderMerchant: Merchant;
  // isMerchant: boolean;

  post: Post;
  slides: Slide[] = [];

  entityTemplate: EntityTemplate;
  entityTemplateLink: string;

  // selectedTags: {
  //   [key: string]: boolean;
  // } = {};
  // selectedTagsLength: number;
  // tagOptions: DropdownOptionItem[];
  // tagPanelState: boolean;
  // orderDelivered: boolean = false;
  userTags: Tag[] = [];

  deliveryImages: Array<{
    image?: string;
    deliveryZone?: DeliveryZone;
    reservation?: Reservation;
    order: string;
  }> = [];

  deliveryForm = new FormGroup({
    image: new FormControl(),
  });

  progress: OrderStatusDeliveryType;
  statusList: OrderStatusDeliveryType[] = [
    'in progress',
    'pending',
    'pickup',
    'shipped',
    'delivered',
  ];

  swiperConfig: SwiperOptions = {
    slidesPerView: 1,
    freeMode: false,
    spaceBetween: 0,
    loop: true,
    slideDuplicateNextClass: 'swiper-slide-duplicate-next',
    slideDuplicatePrevClass: 'swiper-slide-duplicate-prev',
  };

  initialSlide: number;
  activeIndex: number = 0;

  panelOpenState = false;

  // notifications: Notification[] = [];

  @ViewChild('qrcodeTemplate', { read: ElementRef }) qrcodeTemplate: ElementRef;
  @ViewChild('orderQrCode', { read: ElementRef }) orderQrCode: ElementRef;
  @ViewChild('ordersSwiper') ordersSwiper: SwiperComponent;

  constructor(
    private orderService: OrderService,
    private route: ActivatedRoute,
    public router: Router,
    public merchantsService: MerchantsService,
    private postsService: PostsService,
    private tagsService: TagsService,
    private entityTemplateService: EntityTemplateService,
    private clipboard: Clipboard,
    private snackBar: MatSnackBar,
    private _bottomSheet: MatBottomSheet,
    private ngNavigatorShareService: NgNavigatorShareService,
    private deliveryzoneService: DeliveryZonesService,
    private reservationsService: ReservationService,
    private dialogService: DialogService,
    private paymentLogService: PaymentLogsService,
    public _DomSanitizer: DomSanitizer,
    private contactService: ContactService,
    private webformsService: WebformsService
  ) {}

  async ngOnInit() {
    this.route.queryParams.subscribe(async (queryParams) => {
      const { progress } = queryParams;
      this.progress = progress;
      await this.executeProcessesAfterLoading();
    });

    // if (this.ordersToConfirm.length > 0)
    //   this.orderReadyToDeliver =
    //     this.order.orderStatusDelivery === 'pending' ||
    //     this.order.orderStatusDelivery === 'delivered';
  }

  throwErrorScreen() {
    unlockUI();
    this.router.navigate([`others/error-screen/`], {
      queryParams: { type: 'order' },
    });
  }

  async executeProcessesAfterLoading() {
    lockUI();
    this.orderMerchant = this.merchantsService.merchantData;
    // if (!orderId) {
    await this.getOrders();
    this.order =
      this.ordersToConfirm.length > 0
        ? (await this.orderService.order(this.ordersToConfirm[0]._id))?.order
        : null;
    // } else this.order = (await this.orderService.order(orderId))?.order;

    if (!this.order) return this.throwErrorScreen();
    if (this.order.merchants[0]._id !== this.merchantsService.merchantData._id)
      return this.throwErrorScreen();

    this.ordersToConfirm.forEach(async (order) => {
      let deliveryZone: DeliveryZone;
      let reservation: Reservation;
      if (this.isPopulated(order) && order.deliveryZone) {
        deliveryZone = await this.deliveryzoneService.deliveryZone(
          order.deliveryZone
        );
        reservation = await this.reservationsService.getReservation(
          order.items[0].reservation._id
        );
      }
      this.deliveryImages.push({
        image: this.isPopulated(order)
          ? order.deliveryData?.image
            ? order.deliveryData.image
            : null
          : null,
        deliveryZone: deliveryZone ? deliveryZone : null,
        reservation: reservation ? reservation : null,
        order: order._id,
      });
    });

    console.log(this.deliveryImages);

    this.userTags =
      (await this.tagsService.tagsByUser({
        findBy: {
          entity: 'order',
        },
        options: {
          limit: -1,
        },
      })) || [];

    await this.populateOrder(0, 3);

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
    }

    // await this.getDeliveryNotifications();

    if (this.order.items[0].post) {
      this.post = (
        await this.postsService.getPost(this.order.items[0].post._id)
      ).post;
      this.slides = await this.postsService.slidesByPost(this.post._id);
    }

    if (this.post && this.slides.length > 0) {
      const results =
        await this.entityTemplateService.entityTemplateByReference(
          this.post._id,
          'post'
        );

      if (results) {
        this.entityTemplate = results;
        this.entityTemplateLink =
          this.URI + '/qr/article-template/' + this.entityTemplate._id;
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
    let address = '';
    const location = this.order.items[0].deliveryLocation;
    if (location) {
      address = '\n\nDirección: ';
      if (location.street) {
        if (location.houseNumber) address += '#' + location.houseNumber + ', ';
        address += location.street + ', ';
        if (location.referencePoint) address += location.referencePoint + ', ';
        address += location.city + ', República Dominicana';
        if (location.note) address += ` (${location.note})`;
      } else address += location.nickName;
    }

    let giftMessage = '';
    if (this.post?.from) giftMessage += 'De: ' + this.post.from + '\n';
    if (this.post?.targets?.[0]?.name)
      giftMessage += 'Para: ' + this.post.targets[0].name + '\n';
    if (this.post?.message) giftMessage += 'Mensaje: ' + this.post.message;

    // if (this.order.deliveryData) {
    //   this.orderReadyToDeliver = true;
    //   this.orderDelivered = true;
    //   if (this.order.orderStatusDelivery !== 'delivered') {
    //     if (this.isMerchant) await this.changeOrderStatus('delivered');
    //     else if (this.view === 'assistant')
    //       await this.changeOrderStatusAuthless('delivered');
    //     else if (this.view === 'delivery')
    //       await this.changeOrderStatusAuthless('delivered');
    //   }
    // }
    unlockUI();
  }

  async changeSlide(to: 'next' | 'prev') {
    const _Swiper = new Swiper('.swiper');
    console.log(this.activeIndex);
    if (to === 'next') this.activeIndex = ++this.activeIndex;
    else this.activeIndex = --this.activeIndex;

    _Swiper.slideTo(this.activeIndex);

    // TODO validar si el slide fue hacia adelante o atrás
    console.log(this.activeIndex);
    // NOTA: La función tiene await pero podría no tenerlo para hacer más smooth el infinite scroll
    await this.populateOrder(this.activeIndex, 3, true);
  }

  confirmPayment(order: ExtendedItemOrder) {
    this.orderService.orderConfirm(
      order.items[0].saleflow.merchant._id,
      order._id
    );
    order.orderStatus = 'completed';
  }

  async getOrders() {
    const findBy = {
      orderStatus: ['in progress', 'to confirm', 'paid', 'completed'],
    };
    if (this.progress) findBy['orderStatusDelivery'] = this.progress;
    try {
      const result = (
        await this.merchantsService.hotOrdersByMerchant(
          this.orderMerchant._id,
          {
            options: {
              limit: 20,
              sortBy: 'createdAt:desc',
            },
            findBy,
          }
        )
      )?.ordersByMerchant;

      console.log(result);

      this.ordersToConfirm = result;

      // const index = this.ordersToConfirm.map(order => order._id).indexOf(this.order._id);
      // console.log(index);

      // if (index !== -1) this.ordersToConfirm.splice(index, 1, this.order);
      // this.initialSlide = index;
      // this.swiperConfig.initialSlide = index;
    } catch (error) {
      console.log(error);
    }
  }

  // async addTag(tagId: string) {
  //   if (!this.selectedTags[tagId]) {
  //     await this.tagsService.addTagsInOrder(
  //       this.order.items[0].saleflow.merchant._id,
  //       tagId,
  //       this.order._id
  //     );
  //     this.selectedTags[tagId] = true;
  //     this.order.tags.push(tagId);
  //   } else {
  //     await this.tagsService.removeTagsInOrder(
  //       this.order.items[0].saleflow.merchant._id,
  //       tagId,
  //       this.order._id
  //     );
  //     this.selectedTags[tagId] = false;
  //     this.order.tags = this.order.tags.filter((tag) => tag !== tagId);
  //   }
  //   this.selectedTagsLength = Object.entries(this.selectedTags).filter(
  //     (value) => value[1]
  //   ).length;
  // }

  // async getDeliveryNotifications(merchantId: string) {
  //   try {
  //     const result = await this.notificationsService.notifications(
  //       {
  //         options: {
  //           limit: -1,
  //           sortBy: 'createdAt:desc',
  //         },
  //         findBy: {
  //           entity: 'order',
  //           type: 'standard',
  //           mode: 'default',
  //           active: true,
  //         },
  //       },
  //       merchantId
  //     );

  //     const notifications = result.filter((notification) => {
  //       return notification.trigger[0].key === 'orderStatusDelivery';
  //     });

  //     console.log(notifications);

  //     this.notifications = notifications;
  //   } catch (error) {
  //     console.log(error);
  //   }
  // }

  // checkNotificationDeliveryStatus(status: string) {
  //   return this.notifications.find(
  //     (option) => option.trigger[0].value === status
  //   );
  // }

  goToPost() {
    this.router.navigate([
      '/qr/' + '/article-template/' + this.entityTemplate._id,
    ]);
  }

  copyEntityTemplateID(id: string) {
    const entityId = this.formatId(id);
    this.clipboard.copy(entityId);

    this.snackBar.open('Enlace copiado en el portapapeles', '', {
      duration: 2000,
    });
  }

  // share(order: ItemOrder) {
  //   const link = `${this.URI}/ecommerce/order-detail/${order._id}`;
  //   const bottomSheetRef = this._bottomSheet.open(LinksDialogComponent, {
  //     data: [
  //       {
  //         title: `Vista e interfaz con toda la info`,
  //         options: [
  //           {
  //             title: 'Ver como lo verá el visitante',
  //             callback: () => {
  //               this.router.navigate([`/ecommerce/order-detail/${order._id}`], {
  //                 queryParams: { redirectTo: this.router.url },
  //               });
  //             },
  //           },
  //           {
  //             title: 'Compartir el Link de esta sola factura',
  //             callback: () => {
  //               this.ngNavigatorShareService.share({
  //                 title: '',
  //                 url: link,
  //               });
  //             },
  //           },
  //           {
  //             title: 'Copiar el Link de esta sola factura',
  //             callback: () => {
  //               this.clipboard.copy(link);
  //               this.snackBar.open('Enlace copiado en el portapapeles', '', {
  //                 duration: 2000,
  //               });
  //             },
  //           },
  //           {
  //             title: 'Descargar el qrCode de esta sola factura',
  //             callback: () => this.downloadQr(order),
  //           },
  //         ],
  //       },
  //       // {
  //       //   title: `Opciones para el mensajero`,
  //       //   options: [
  //       //     {
  //       //       title: 'Compartir el Link',
  //       //       callback: () => {
  //       //         this.ngNavigatorShareService.share({
  //       //           title: '',
  //       //           url: `${this.URI}/ecommerce/order-process/${this.orderMerchant._id}?view=delivery`,
  //       //         });
  //       //       },
  //       //     },
  //       //     {
  //       //       title: 'Copiar el Link',
  //       //       callback: () => {
  //       //         this.clipboard.copy(
  //       //           `${this.URI}/ecommerce/order-process/${this.orderMerchant._id}?view=delivery`
  //       //         );
  //       //         this.snackBar.open('Enlace copiado en el portapapeles', '', {
  //       //           duration: 2000,
  //       //         });
  //       //       },
  //       //     },
  //       //   ],
  //       // },
  //       // {
  //       //   title: `Opciones para quien prepara la orden`,
  //       //   options: [
  //       //     {
  //       //       title: 'Compartir el Link',
  //       //       callback: () => {
  //       //         this.ngNavigatorShareService.share({
  //       //           title: '',
  //       //           url: `${this.URI}/ecommerce/order-process/${this.orderMerchant._id}?view=assistant`,
  //       //         });
  //       //       },
  //       //     },
  //       //     {
  //       //       title: 'Copiar el Link',
  //       //       callback: () => {
  //       //         this.clipboard.copy(
  //       //           `${this.URI}/ecommerce/order-process/${this.orderMerchant._id}?view=assistant`
  //       //         );
  //       //         this.snackBar.open('Enlace copiado en el portapapeles', '', {
  //       //           duration: 2000,
  //       //         });
  //       //       },
  //       //     },
  //       //   ],
  //       // },
  //     ],
  //   });
  // }

  // async onImageInput(input: File) {
  //   if (this.view === 'delivery') {
  //     lockUI();
  //     this.deliveryForm.get('image').patchValue(input);
  //     try {
  //       const result = await this.orderService.updateOrderDeliveryData(
  //         { image: this.deliveryForm.get('image').value[0] },
  //         this.ordersToConfirm[this.activeIndex]._id
  //       );

  //       this.deliveryImages.forEach((deliveryImage) => {
  //         if (deliveryImage.order === result._id)
  //           deliveryImage.image = result.deliveryData.image;
  //       });

  //       await this.orderService.orderSetStatusDeliveryWithoutAuth(
  //         'delivered',
  //         this.ordersToConfirm[this.activeIndex]._id
  //       );

  //       this.ordersToConfirm[this.activeIndex].orderStatusDelivery =
  //         'delivered';
  //       this.orderReadyToDeliver = false;
  //       this.orderDelivered = true;
  //       unlockUI();
  //     } catch (error) {
  //       console.log(error);
  //       unlockUI();
  //     }
  //   }
  // }

  async changeOrderStatus(value: OrderStatusDeliveryType) {
    if (this.ordersToConfirm[this.activeIndex].orderStatusDelivery === value)
      return;
    this.ordersToConfirm[this.activeIndex].orderStatusDelivery = value;

    try {
      await this.orderService.orderSetStatusDelivery(
        value,
        this.ordersToConfirm[this.activeIndex]._id
      );
    } catch (error) {
      console.log(error);
    }
  }

  async updateCurrentSlideData(event: any) {
    console.log('Cambiando de slide', event);
    console.log(event.activeIndex);

    this.activeIndex = event.activeIndex;

    // TODO validar si el slide fue hacia adelante o atrás

    // NOTA: La función tiene await pero podría no tenerlo para hacer más smooth el infinite scroll
    await this.populateOrder(event.activeIndex, 3, true);

    // if (
    //   this.ordersToConfirm[this.activeIndex].deliveryData?.image ||
    //   this.ordersToConfirm[this.activeIndex].orderStatusDelivery === 'delivered'
    // ) {
    //   this.orderReadyToDeliver = false;
    //   this.orderDelivered = true;
    //   if (
    //     this.ordersToConfirm[this.activeIndex].orderStatusDelivery === 'pending'
    //   ) {
    //     await this.orderService.orderSetStatusDeliveryWithoutAuth(
    //       'delivered',
    //       this.ordersToConfirm[this.activeIndex]._id
    //     );
    //     this.ordersToConfirm[this.activeIndex].orderStatusDelivery =
    //       'delivered';
    //   }
    // } else if (
    //   this.ordersToConfirm[this.activeIndex].orderStatusDelivery === 'pending'
    // ) {
    //   this.orderReadyToDeliver = true;
    //   this.orderDelivered = false;
    // } else {
    //   this.orderReadyToDeliver = false;
    //   this.orderDelivered = false;
    // }
  }

  isPopulated(order: ItemOrder): boolean {
    if (order.createdAt) return true;
    else return false;
  }

  /**
   * Función que popula progresivamente las órdenes del swiper
   * @param index  // Posición del arreglo de órdenes a partir de la cual se empieza a popular
   * @param n  // Número de órdenes a popular partiendo del index
   * @param w  // Dirección en la que se mueve el swiper (true: adelante, false: atrás)
   */
  async populateOrder(index: number, n: number = 1, w: boolean = true) {
    console.log(index);
    console.log([...this.ordersToConfirm]);
    if (w) {
      console.log('adelante');
      for (let i = index; i < index + n; i++) {
        console.log(i);
        if (i < this.ordersToConfirm.length) {
          if (!this.isPopulated(this.ordersToConfirm[i])) {
            console.log('dentro del if not populated');
            const order: ExtendedItemOrder = (
              await this.orderService.order(this.ordersToConfirm[i]._id)
            )?.order;
            order.loadedDeliveryStatus = order.orderStatusDelivery;
            this.ordersToConfirm.splice(i, 1, order);
            console.log(this.deliveryImages[i]);
            order.payment = order.subtotals.reduce(
              (prev, curr) => prev + curr.amount,
              0
            );
            this.deliveryImages[i].image = order.deliveryData?.image
              ? order.deliveryData?.image
              : null;

            let deliveryZone: DeliveryZone;
            let reservation: Reservation;
            if (order.deliveryZone) {
              deliveryZone = await this.deliveryzoneService.deliveryZone(
                order.deliveryZone
              );
              this.deliveryImages[i].deliveryZone = deliveryZone;
            }

            if (order.items[0].reservation) {
              reservation = await this.reservationsService.getReservation(
                order.items[0].reservation._id
              );
              this.deliveryImages[i].reservation = reservation;
            }
            console.log(order.ocr);
            if (!order.ocr) {
              const result = await this.paymentLogService.paymentLogsByOrder({
                findBy: {
                  order: order._id,
                },
              });

              if (
                result &&
                result.length > 0 &&
                result[0].paymentMethod === 'azul'
              ) {
                order.payedWithAzul = true;
              }
            } else {
              order.paymentType =
                {
                  'bank-transfer': 'transferencia bancaria',
                  azul: 'tarjeta: xx.6547',
                }[order.ocr.platform] || 'Desconocido';
            }
            order.tagsData = this.userTags.filter((tag) =>
              order.tags.includes(tag._id)
            );
            console.log(order.tagsData);
            order.benefits = await this.orderService.orderBenefits(order._id);
            const userContact = this.getUserContact(order.user._id);
            if (
              !userContact &&
              !this.usersWithoutContact.includes(order.user._id)
            ) {
              const contact = (
                await this.contactService.contacts({
                  findBy: {
                    user: order.user._id,
                  },
                  options: {
                    limit: 1,
                    sortBy: 'createdAt:desc',
                  },
                })
              )[0];
              if (contact) {
                this.usersContact.push(contact);
              } else this.usersWithoutContact.push(order.user._id);
            }
            this.getAnswersForEachItem(order);
            console.log(`Posición ${i} reemplazada`);
          } else {
            console.log(`Posición ${i} ya está populada`);
            continue;
          }
        } else {
          console.log('Array fuera de límite superior');
        }
      }
    } else {
      console.log('atrás');
      for (let i = index; i > index + n; i--) {
        if (i > 0) {
          if (!this.isPopulated(this.ordersToConfirm[i])) {
            const order = (
              await this.orderService.order(this.ordersToConfirm[i]._id)
            )?.order;
            this.ordersToConfirm.splice(i, 1, order);
            console.log(`Posición ${i} reemplazada`);
          } else continue;
        } else {
          console.log('Array fuera de límite inferior');
        }
      }
    }

    console.log(this.ordersToConfirm);
  }

  urlIsVideo(url: string) {
    return isVideo(url);
  }

  async getAnswersForEachItem(order: ExtendedItemOrder) {
    order.answersByItem = {};
    order.webformsByItem = {};
    const answers: Array<WebformAnswer> =
      await this.webformsService.answerByOrder(order._id);

    console.log('AnswersByOrder', answers);

    if (answers?.length) {
      const webformsIds = [];
      for (const item of order.items) {
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

      for (const item of order.items) {
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
              order.webformsByItem[item._id] = webformObject;

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

            order.answersByItem[item._id] = answersForWebform;
          }
        }
      }
    }
  }

  getUserContact(id: string) {
    return this.usersContact.find((value) => value.user === id);
  }

  convertDate(dateString: string) {
    const date = new Date(dateString);

    return date
      .toLocaleString('es-MX', {
        hour12: true,
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
      .toLocaleUpperCase();
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

  openDialog(order: ExtendedItemOrder) {
    this.dialogService.open(OrderInfoComponent, {
      type: 'flat-action-sheet',
      props: {
        order,
      },
      customClass: 'app-dialog',
      flags: ['no-header'],
    });
  }

  downloadEntityTemplateQr(qrElment: ElementRef) {
    const parentElement = qrElment.nativeElement.querySelector('img').src;
    let blobData = base64ToBlob(parentElement);
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
      link.download = this.formatId(this.order.dateId);
      link.click();
    }
  }

  downloadQr(order: ItemOrder) {
    const parentElement =
      this.orderQrCode.nativeElement.querySelector('img').src;
    let blobData = base64ToBlob(parentElement);
    if (window.navigator && (window.navigator as any).msSaveOrOpenBlob) {
      //IE
      (window.navigator as any).msSaveOrOpenBlob(
        blobData,
        this.formatId(order.dateId)
      );
    } else {
      // chrome
      const blob = new Blob([blobData], { type: 'image/png' });
      const url = window.URL.createObjectURL(blob);
      // window.open(url);
      const link = document.createElement('a');
      link.href = url;
      link.download = this.formatId(order.dateId);
      link.click();
    }
  }

  orderHasDelivery(deliveryZone: DeliveryZone, order: ItemOrder) {
    if (deliveryZone) return true;
    if (order.items[0]?.deliveryLocation?.street) return true;

    return false;
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

  private formatHour(date: Date, breakTime?: number) {
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

  returnEvent() {
    let queryParams = {};
    if (this.redirectTo.includes('?')) {
      const url = this.redirectTo.split('?');
      this.redirectTo = url[0];
      const queryParamList = url[1].split('&');
      for (const param in queryParamList) {
        const keyValue = queryParamList[param].split('=');
        queryParams[keyValue[0]] = keyValue[1];
      }
    }
    this.router.navigate([this.redirectTo], {
      queryParams,
    });
  }

  mouseDown: boolean;
  startX: number;
  scrollLeft: number;

  stopDragging() {
    this.mouseDown = false;
  }

  startDragging(e: MouseEvent, el: HTMLDivElement) {
    this.mouseDown = true;
    this.startX = e.pageX - el.offsetLeft;
    this.scrollLeft = el.scrollLeft;
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
