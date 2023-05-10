import { Clipboard } from '@angular/cdk/clipboard';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { NgNavigatorShareService } from 'ng-navigator-share';
import { SwiperComponent } from 'ngx-swiper-wrapper';
import { base64ToBlob } from 'src/app/core/helpers/files.helpers';
import { formatID } from 'src/app/core/helpers/strings.helpers';
import { lockUI, unlockUI } from 'src/app/core/helpers/ui.helpers';
import { Contact } from 'src/app/core/models/contact';
import { DeliveryZone } from 'src/app/core/models/deliveryzone';
import { EntityTemplate } from 'src/app/core/models/entity-template';
import { Merchant } from 'src/app/core/models/merchant';
import { ItemOrder, OrderStatusDeliveryType } from 'src/app/core/models/order';
import { Post, Slide } from 'src/app/core/models/post';
import { Reservation } from 'src/app/core/models/reservation';
import { Webform, WebformAnswer } from 'src/app/core/models/webform';
import { AuthService } from 'src/app/core/services/auth.service';
import { ContactService } from 'src/app/core/services/contact.service';
import { DeliveryZonesService } from 'src/app/core/services/deliveryzones.service';
import { EntityTemplateService } from 'src/app/core/services/entity-template.service';
import { HeaderService } from 'src/app/core/services/header.service';
import { MerchantsService } from 'src/app/core/services/merchants.service';
import { OrderService } from 'src/app/core/services/order.service';
import { PostsService } from 'src/app/core/services/posts.service';
import { ReservationService } from 'src/app/core/services/reservations.service';
import { WebformsService } from 'src/app/core/services/webforms.service';
import { DialogService } from 'src/app/libs/dialog/services/dialog.service';
import { ContactHeaderComponent } from 'src/app/shared/components/contact-header/contact-header.component';
import { ImageViewComponent } from 'src/app/shared/dialogs/image-view/image-view.component';
import { LinksDialogComponent } from 'src/app/shared/dialogs/links-dialog/links-dialog.component';
import { environment } from 'src/environments/environment';
import { SwiperOptions } from 'swiper';

interface ExtendedOrder extends ItemOrder {
  loadedDeliveryStatus?: OrderStatusDeliveryType;
  answersByItem?: Record<string, WebformAnswer>;
  webformsByItem?: Record<string, Webform>;
}

@Component({
  selector: 'app-order-process',
  templateUrl: './order-process.component.html',
  styleUrls: ['./order-process.component.scss'],
})
export class OrderProcessComponent implements OnInit {
  env: string = environment.assetsUrl;
  URI: string = environment.uri;

  order: ItemOrder;
  ordersReadyToDeliver: ExtendedOrder[] = [];
  usersContact: Contact[] = [];
  usersWithoutContact: string[] = [];

  deliveryZone: DeliveryZone;

  orderDeliveryStatus = this.orderService.orderDeliveryStatus;
  formatId = formatID;
  // deliveryStatusOptions: DropdownOptionItem[] = [
  //   {
  //     text: 'En preparación',
  //     value: 'in progress',
  //     selected: false,
  //     hide: false,
  //   },
  // ];

  redirectTo: string = null;
  view: 'delivery' | 'assistant';

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
  merchant: Merchant;

  post: Post;
  slides: Slide[] = [];

  entityTemplate: EntityTemplate;
  entityTemplateLink: string;

  orderReadyToDeliver: boolean = false;
  // orderShipped: boolean = false;
  orderDelivered: boolean = false;

  deliveryImages: Array<{
    image?: string;
    deliveryZone?: DeliveryZone;
    reservation?: Reservation;
    order: string;
  }> = [];

  deliveryForm = new FormGroup({
    image: new FormControl(),
  });

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

  @ViewChild('qrcodeTemplate', { read: ElementRef }) qrcodeTemplate: ElementRef;
  @ViewChild('orderQrCode', { read: ElementRef }) orderQrCode: ElementRef;
  @ViewChild('ordersSwiper') ordersSwiper: SwiperComponent;

  constructor(
    private orderService: OrderService,
    public router: Router,
    private route: ActivatedRoute,
    private headerService: HeaderService,
    private authService: AuthService,
    private merchantsService: MerchantsService,
    private postsService: PostsService,
    // private tagsService: TagsService,
    private entityTemplateService: EntityTemplateService,
    private clipboard: Clipboard,
    private snackBar: MatSnackBar,
    private _bottomSheet: MatBottomSheet,
    private ngNavigatorShareService: NgNavigatorShareService,
    private deliveryzoneService: DeliveryZonesService,
    private reservationsService: ReservationService,
    private dialogService: DialogService,
    // private notificationsService: NotificationsService,
    private contactService: ContactService,
    private webformsService: WebformsService
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(async (queryParams) => {
      const { redirectTo, view, orderId, deliveryZone } = queryParams;

      this.redirectTo = redirectTo;
      this.deliveryZone = deliveryZone;
      if (view) this.view = view;

      if (typeof redirectTo === 'undefined') this.redirectTo = null;
      if (typeof deliveryZone === 'undefined') this.deliveryZone = null;

      this.route.params.subscribe(async (params) => {
        const { merchantId } = params;

        await this.executeProcessesAfterLoading(
          merchantId,
          orderId,
          deliveryZone
        );
        if (orderId) await this.getOrders(this.merchant._id, deliveryZone);

        if (this.ordersReadyToDeliver.length > 0)
          this.orderReadyToDeliver =
            this.order.orderStatusDelivery === 'pending' ||
            this.order.orderStatusDelivery === 'shipped' ||
            this.order.orderStatusDelivery === 'delivered';
      });
    });
  }

  async executeProcessesAfterLoading(
    merchantId: string,
    orderId?: string,
    deliveryZone?: string
  ) {
    lockUI();

    this.merchant = await this.merchantsService.merchant(merchantId);

    if (!orderId) {
      await this.getOrders(this.merchant._id, deliveryZone);
      this.order =
        this.ordersReadyToDeliver.length > 0
          ? (await this.orderService.order(this.ordersReadyToDeliver[0]._id))
              ?.order
          : null;
    } else this.order = (await this.orderService.order(orderId))?.order;

    if (!this.order) {
      unlockUI();
      // this.router.navigate([`others/error-screen/`], {
      //   queryParams: { type: 'order' },
      // });
      return;
    }

    this.ordersReadyToDeliver.forEach(async (order) => {
      let deliveryZone: DeliveryZone;
      let reservation: Reservation;
      if (
        this.view === 'delivery' &&
        this.isPopulated(order) &&
        order.deliveryZone
      ) {
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

    this.headerService.user = await this.authService.me();

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

    // if (this.order.orderStatusDelivery === 'shipped') {
    //   this.orderShipped = true;
    // }
    if (this.order.deliveryData) {
      this.orderReadyToDeliver = true;
      this.orderDelivered = true;
      if (this.order.orderStatusDelivery !== 'delivered') {
        if (this.view === 'assistant')
          await this.changeOrderStatusAuthless('delivered');
        else if (this.view === 'delivery')
          await this.changeOrderStatusAuthless('delivered');
      }
    }
    unlockUI();
  }

  async getOrders(merchantId: string, deliveryZone?: string) {
    const findBy = {
      merchant: merchantId,
      deliveryZone: deliveryZone,
      orderStatus: ['to confirm', 'paid', 'completed'],
      orderStatusDelivery:
        this.view === 'delivery'
          ? 'pending'
          : // ? ['pending', 'shipped']
          this.view === 'assistant'
          ? 'in progress'
          : null,
    };
    try {
      const result = await this.orderService.orderByMerchantDelivery({
        options: {
          limit: 20,
          sortBy: 'createdAt:desc',
        },
        findBy,
      });

      console.log(result);

      this.ordersReadyToDeliver = result;

      // const index = this.ordersReadyToDeliver.map(order => order._id).indexOf(this.order._id);
      // console.log(index);

      // if (index !== -1) this.ordersReadyToDeliver.splice(index, 1, this.order);
      // this.initialSlide = index;
      // this.swiperConfig.initialSlide = index;
    } catch (error) {
      console.log(error);
    }
  }

  async changeOrderStatusAuthless(value: OrderStatusDeliveryType) {
    if (
      this.ordersReadyToDeliver[this.activeIndex].orderStatusDelivery === value
    )
      return;
    this.ordersReadyToDeliver[this.activeIndex].orderStatusDelivery = value;

    try {
      await this.orderService.orderSetStatusDeliveryWithoutAuth(
        value,
        this.ordersReadyToDeliver[this.activeIndex]._id
      );
      if (value === 'pending') this.orderReadyToDeliver = true;
      else if (value === 'in progress') this.orderReadyToDeliver = false;
      // if (value === 'shipped') this.orderShipped = true;
      // else if (value === 'pending') this.orderShipped = false;
      if (value === 'delivered') this.orderDelivered = true;
      else if (value === 'shipped') this.orderDelivered = false;
    } catch (error) {
      console.log(error);
    }
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

  share(order: ItemOrder) {
    const link = `${this.URI}/ecommerce/order-detail/${order._id}`;
    const data = [
      {
        title: `Vista e interfaz con la info limitada`,
        options: [
          {
            title: 'Ver como lo verá el visitante',
            callback: () => {
              this.router.navigate([`/ecommerce/order-detail/${order._id}`], {
                queryParams: {
                  redirectTo: this.router.url,
                  navigationWithMessage: 'Vista del visitante',
                },
              });
            },
          },
          {
            title: 'Compartir el Link de esta sola factura',
            callback: () => {
              this.ngNavigatorShareService.share({
                title: '',
                url: link,
              });
            },
          },
          {
            title: 'Copiar el Link de esta sola factura',
            callback: () => {
              this.clipboard.copy(link);
              this.snackBar.open('Enlace copiado en el portapapeles', '', {
                duration: 2000,
              });
            },
          },
          {
            title: 'Descargar el qrCode de esta sola factura',
            callback: () => this.downloadQr(order),
          },
        ],
      },
    ];
    this._bottomSheet.open(LinksDialogComponent, {
      data,
    });
  }

  async onImageInput(input: File) {
    if (this.view !== 'delivery') return;
    lockUI();
    this.deliveryForm.get('image').patchValue(input);
    try {
      const result = await this.orderService.updateOrderDeliveryData(
        { image: this.deliveryForm.get('image').value[0] },
        this.ordersReadyToDeliver[this.activeIndex]._id
      );

      this.deliveryImages.forEach((deliveryImage) => {
        if (deliveryImage.order === result._id)
          deliveryImage.image = result.deliveryData.image;
      });

      await this.orderService.orderSetStatusDeliveryWithoutAuth(
        'delivered',
        this.ordersReadyToDeliver[this.activeIndex]._id
      );

      this.ordersReadyToDeliver[this.activeIndex].orderStatusDelivery =
        'delivered';
      this.orderReadyToDeliver = false;
      this.orderDelivered = true;
      unlockUI();
    } catch (error) {
      console.log(error);
      unlockUI();
    }
  }

  async updateCurrentSlideData(event: any) {
    console.log('Cambiando de slide', event);
    console.log(event.activeIndex);

    this.activeIndex = event.activeIndex;

    // TODO validar si el slide fue hacia adelante o atrás

    // NOTA: La función tiene await pero podría no tenerlo para hacer más smooth el infinite scroll
    await this.populateOrder(event.activeIndex, 3, true);

    if (
      this.ordersReadyToDeliver[this.activeIndex].deliveryData?.image ||
      this.ordersReadyToDeliver[this.activeIndex].orderStatusDelivery ===
        'delivered'
    ) {
      this.orderReadyToDeliver = false;
      // this.orderShipped = false;
      this.orderDelivered = true;
      if (
        this.ordersReadyToDeliver[this.activeIndex].orderStatusDelivery ===
          'pending' ||
        this.ordersReadyToDeliver[this.activeIndex].orderStatusDelivery ===
          'shipped'
      ) {
        await this.orderService.orderSetStatusDeliveryWithoutAuth(
          'delivered',
          this.ordersReadyToDeliver[this.activeIndex]._id
        );
        this.ordersReadyToDeliver[this.activeIndex].orderStatusDelivery =
          'delivered';
      }
    } else if (
      this.ordersReadyToDeliver[this.activeIndex].orderStatusDelivery ===
      'pending'
    ) {
      this.orderReadyToDeliver = true;
      // this.orderShipped = false;
      this.orderDelivered = false;
      // } else if (
      //   this.ordersReadyToDeliver[this.activeIndex].orderStatusDelivery ===
      //   'shipped'
      // ) {
      //   this.orderReadyToDeliver = false;
      //   this.orderShipped = true;
      //   this.orderDelivered = false;
    } else {
      this.orderReadyToDeliver = false;
      this.orderDelivered = false;
      // this.orderShipped = false;
    }
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
    console.log(this.ordersReadyToDeliver);
    if (w) {
      console.log('adelante');
      for (let i = index; i < index + n; i++) {
        console.log(i);
        if (i < this.ordersReadyToDeliver.length) {
          if (!this.isPopulated(this.ordersReadyToDeliver[i])) {
            const order: ExtendedOrder = (
              await this.orderService.order(this.ordersReadyToDeliver[i]._id)
            )?.order;
            order.loadedDeliveryStatus = order.orderStatusDelivery;
            this.ordersReadyToDeliver.splice(i, 1, order);
            console.log(this.deliveryImages[i]);
            this.deliveryImages[i].image = order.deliveryData?.image
              ? order.deliveryData?.image
              : null;

            if (this.view === 'delivery') {
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
            }
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
            if (this.view === 'assistant') this.getAnswersForEachItem(order);
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
          if (!this.isPopulated(this.ordersReadyToDeliver[i])) {
            const order = (
              await this.orderService.order(this.ordersReadyToDeliver[i]._id)
            )?.order;
            this.ordersReadyToDeliver.splice(i, 1, order);
            console.log(`Posición ${i} reemplazada`);
          } else continue;
        } else {
          console.log('Array fuera de límite inferior');
        }
      }
    }

    console.log(this.ordersReadyToDeliver);
  }

  async getAnswersForEachItem(order: ExtendedOrder) {
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

  openContactInfo(order: ExtendedOrder) {
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
}
