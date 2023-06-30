import { Clipboard } from '@angular/cdk/clipboard';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DomSanitizer } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { SwiperComponent } from 'ngx-swiper-wrapper';
import { base64ToBlob } from 'src/app/core/helpers/files.helpers';
import {
  formatID,
  formatPhoneNumber,
  isVideo,
  truncateString,
} from 'src/app/core/helpers/strings.helpers';
import { lockUI, unlockUI } from 'src/app/core/helpers/ui.helpers';
import { Contact } from 'src/app/core/models/contact';
import { DeliveryZone } from 'src/app/core/models/deliveryzone';
import { EntityTemplate } from 'src/app/core/models/entity-template';
import { Merchant } from 'src/app/core/models/merchant';
import { Notification } from 'src/app/core/models/notification';
import { ItemOrder, OrderStatusDeliveryType } from 'src/app/core/models/order';
import { Post, Slide } from 'src/app/core/models/post';
import { Reservation } from 'src/app/core/models/reservation';
import { Tag } from 'src/app/core/models/tags';
import { Webform, WebformAnswer } from 'src/app/core/models/webform';
import { ContactService } from 'src/app/core/services/contact.service';
import { DeliveryZonesService } from 'src/app/core/services/deliveryzones.service';
import { EntityTemplateService } from 'src/app/core/services/entity-template.service';
import { MerchantsService } from 'src/app/core/services/merchants.service';
import { NotificationsService } from 'src/app/core/services/notifications.service';
import { OrderService } from 'src/app/core/services/order.service';
import { PaymentLogsService } from 'src/app/core/services/paymentLogs.service';
import { PostsService } from 'src/app/core/services/posts.service';
import { ReservationService } from 'src/app/core/services/reservations.service';
import { TagsService } from 'src/app/core/services/tags.service';
import { WebformsService } from 'src/app/core/services/webforms.service';
import { DialogService } from 'src/app/libs/dialog/services/dialog.service';
import { ContactHeaderComponent } from 'src/app/shared/components/contact-header/contact-header.component';
import { BuyerNotificationDialogComponent } from 'src/app/shared/dialogs/buyer-notification-dialog/buyer-notification-dialog.component';
import { ImageViewComponent } from 'src/app/shared/dialogs/image-view/image-view.component';
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

  order: ExtendedItemOrder;
  ordersToConfirm: ExtendedItemOrder[] = [];
  usersContact: Contact[] = [];
  usersWithoutContact: string[] = [];

  deliveryZone: DeliveryZone;

  orderDeliveryStatus = this.orderService.orderDeliveryStatus;
  formatId = formatID;
  truncateString = truncateString;

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

  orderDate: string;
  orderMerchant: Merchant;

  post: Post;
  slides: Slide[] = [];

  entityTemplate: EntityTemplate;
  entityTemplateLink: string;
  userTags: Tag[] = [];

  deliveryImages: Array<{
    image?: string;
    deliveryZone?: DeliveryZone;
    reservation?: Reservation;
    statusList?: OrderStatusDeliveryType[];
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
    // slideDuplicateNextClass: 'swiper-slide-duplicate-next',
    // slideDuplicatePrevClass: 'swiper-slide-duplicate-prev',
  };

  initialSlide: number;
  activeIndex: number = 0;

  openNavigation = false;

  notifications: Notification[] = [];

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
    private deliveryzoneService: DeliveryZonesService,
    private reservationsService: ReservationService,
    private dialogService: DialogService,
    private paymentLogService: PaymentLogsService,
    public _DomSanitizer: DomSanitizer,
    private contactService: ContactService,
    private webformsService: WebformsService,
    private notificationsService: NotificationsService
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
    const orderId = this.route.snapshot.paramMap.get('orderId');
    if (orderId) {
      this.order = await this.orderService.orderByDateId(orderId);
      this.order.payment = this.order.subtotals.reduce(
        (prev, curr) => prev + curr.amount,
        0
      );
      if (!this.order.ocr) {
        const result = await this.paymentLogService.paymentLogsByOrder({
          findBy: {
            order: this.order._id,
          },
        });

        if (result && result.length > 0 && result[0].paymentMethod === 'azul') {
          this.order.payedWithAzul = true;
        }
      } else {
        this.order.paymentType =
          {
            'bank-transfer': 'transferencia bancaria',
            azul: 'tarjeta: xx.6547',
          }[this.order.ocr.platform] || 'Desconocido';
      }
      this.order.tagsData = this.userTags.filter((tag) =>
        this.order.tags.includes(tag._id)
      );
      this.order.benefits = await this.orderService.orderBenefits(
        this.order._id
      );
      this.ordersToConfirm = [this.order];
    } else {
      await this.getOrders();
      this.order =
        this.ordersToConfirm.length > 0
          ? (await this.orderService.order(this.ordersToConfirm[0]._id))?.order
          : null;
    }

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

    await this.getNotifications();

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
    const { name, phone, email } = order.user;
    const link = `${this.URI}/ecommerce/order-detail/${order._id}`;
    const notification = this.notifications.find(
      (notif) =>
        notif.trigger[0].key === 'orderStatus' &&
        notif.trigger[0].value === 'completed'
    );
    let message: string;
    if (notification) {
      message = notification.message.replace('[name]', name || phone || email);
    } else {
      message = `El pago de tu factura ${this.formatShortId(
        order.dateId
      )} fue confirmado, aquí más info: ${link}`;
    }
    this._bottomSheet.open(BuyerNotificationDialogComponent, {
      data: {
        username: name || formatPhoneNumber(phone) || email,
        message,
        link: `https://wa.me/${phone}?text=${encodeURI(message)}`,
      },
    });
  }

  formatShortId(id: string) {
    return formatID(id).split(/(?=N)/g)[1];
  }

  async getOrders() {
    const findBy = {
      orderStatus: ['to confirm', 'paid', 'completed'],
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

  async getNotifications() {
    try {
      const result = await this.notificationsService.notifications(
        {
          options: {
            limit: -1,
            sortBy: 'createdAt:desc',
          },
          findBy: {
            entity: 'order',
            type: 'standard',
            mode: 'default',
            active: true,
          },
        },
        this.merchantsService.merchantData._id
      );

      this.notifications = result;
    } catch (error) {
      console.log(error);
    }
  }

  checkNotificationDeliveryStatus(status: OrderStatusDeliveryType) {
    const notifications = this.notifications.filter((notification) => {
      return notification.trigger[0].key === 'orderStatusDelivery';
    });
    return notifications.find((option) => option.trigger[0].value === status);
  }

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

  async changeOrderStatus(value: OrderStatusDeliveryType) {
    if (this.ordersToConfirm[this.activeIndex].orderStatusDelivery === value)
      return;
    this.ordersToConfirm[this.activeIndex].orderStatusDelivery = value;
    this.openNotificationDialog(value);

    try {
      await this.orderService.orderSetStatusDelivery(
        value,
        this.ordersToConfirm[this.activeIndex]._id
      );
    } catch (error) {
      console.log(error);
    }
  }

  openNotificationDialog(value: OrderStatusDeliveryType) {
    const { name, phone, email } = this.ordersToConfirm[this.activeIndex].user;
    const notification = this.checkNotificationDeliveryStatus(value);

    const link = `${this.URI}/ecommerce/order-detail/${
      this.ordersToConfirm[this.activeIndex]._id
    }`;
    let message: string;
    if (notification) {
      message = notification.message.replace('[name]', name || phone || email);
    } else {
      message = `tu factura ${this.formatShortId(
        this.ordersToConfirm[this.activeIndex].dateId
      )} progresó a ${this.orderDeliveryStatus(value)}, aquí más info: ${link}`;
    }

    this._bottomSheet.open(BuyerNotificationDialogComponent, {
      data: {
        username: name || phone || email,
        message,
        link: `https://wa.me/${phone}?text=${encodeURI(message)}`,
        deliveryStatus: value,
      },
    });
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

            console.log(this.deliveryImages);

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

            const paymentLog = await this.paymentLogService.paymentLogsByOrder({
              findBy: {
                order: order._id,
              },
            });

            if (paymentLog && paymentLog.length > 0 && paymentLog[0].paymentMethod === 'azul') {
              order.payedWithAzul = true;
              order.paymentType = 'azul';
            } else {
              order.paymentType =
              {
                'bank-transfer': paymentLog && paymentLog.length > 0 ? this.getPaymentMethodName(paymentLog[0].paymentMethod) : null,
                azul: 'tarjeta: xx.6547',
              }[order.ocr.platform] || 'Desconocido';
            }

            order.tagsData = this.userTags.filter((tag) =>
              order.tags.includes(tag._id)
            );
            console.log(order.tagsData);
            order.benefits = await this.orderService.orderBenefits(order._id);
            const userContact = order?.user ? this.getUserContact(order?.user?._id) : null;
            if (
              order?.user &&
              !userContact &&
              !this.usersWithoutContact.includes(order?.user?._id)
            ) {
              const contact = (
                await this.contactService.contacts({
                  findBy: {
                    user: order?.user?._id,
                  },
                  options: {
                    limit: 1,
                    sortBy: 'createdAt:desc',
                  },
                })
              )[0];
              if (contact) {
                this.usersContact.push(contact);
              } else this.usersWithoutContact.push(order?.user?._id);
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

  // openDialog(order: ExtendedItemOrder) {
  //   this.dialogService.open(OrderInfoComponent, {
  //     type: 'flat-action-sheet',
  //     props: {
  //       order,
  //     },
  //     customClass: 'app-dialog',
  //     flags: ['no-header'],
  //   });
  // }

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
    if (order.items[0]?.deliveryLocation) return true;

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

  openContactInfo(order: ExtendedItemOrder) {
    this._bottomSheet.open(ContactHeaderComponent, {
      data: {
        bio: order.user.bio,
        contact: this.getUserContact(order.user._id),
      },
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

  getStatusList(order: ExtendedItemOrder) {
    const statusList: OrderStatusDeliveryType[] = ['in progress', 'delivered'];

    if (order?.items[0]?.deliveryLocation) {
      if (order?.items[0]?.deliveryLocation?.street) {
        statusList.splice(1, 0, 'pending');
        statusList.splice(2, 0, 'shipped');
      } else statusList.splice(1, 0, 'pickup');
    }

    return statusList;
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
}
