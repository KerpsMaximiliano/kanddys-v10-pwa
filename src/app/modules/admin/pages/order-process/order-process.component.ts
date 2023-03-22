import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { base64ToBlob, fileToBase64 } from 'src/app/core/helpers/files.helpers';
import { formatID } from 'src/app/core/helpers/strings.helpers';
import { lockUI, unlockUI } from 'src/app/core/helpers/ui.helpers';
import { EntityTemplate } from 'src/app/core/models/entity-template';
import { Merchant } from 'src/app/core/models/merchant';
import { ItemOrder, OrderStatusDeliveryType, OrderStatusNameType } from 'src/app/core/models/order';
import { Post, Slide } from 'src/app/core/models/post';
import { Tag } from 'src/app/core/models/tags';
import { AuthService } from 'src/app/core/services/auth.service';
import { EntityTemplateService } from 'src/app/core/services/entity-template.service';
import { HeaderService } from 'src/app/core/services/header.service';
import { MerchantsService } from 'src/app/core/services/merchants.service';
import { OrderService } from 'src/app/core/services/order.service';
import { PostsService } from 'src/app/core/services/posts.service';
import { TagsService } from 'src/app/core/services/tags.service';
import { DropdownOptionItem } from 'src/app/shared/components/dropdown-menu/dropdown-menu.component';
import { environment } from 'src/environments/environment';
import { Clipboard } from '@angular/cdk/clipboard';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FormControl, FormGroup } from '@angular/forms';
import Swiper, { SwiperOptions } from 'swiper';
import { SwiperComponent } from 'ngx-swiper-wrapper';
import { LinksDialogComponent } from 'src/app/shared/dialogs/links-dialog/links-dialog.component';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { NgNavigatorShareService } from 'ng-navigator-share';
import { DeliveryZone } from 'src/app/core/models/deliveryzone';

@Component({
  selector: 'app-order-process',
  templateUrl: './order-process.component.html',
  styleUrls: ['./order-process.component.scss']
})
export class OrderProcessComponent implements OnInit {

  env: string = environment.assetsUrl;
  URI: string = environment.uri;

  order: ItemOrder;
  ordersReadyToDeliver: ItemOrder[] = [];

  deliveryZone: DeliveryZone;

  orderDeliveryStatus = this.orderService.orderDeliveryStatus;
  formatId = formatID;
  deliveryStatusOptions: DropdownOptionItem[] = [
    {
      text: 'En preparación',
      value: 'in progress',
      selected: false,
      hide: false,
    },
  ];

  redirectTo: string = null;
  view: 'delivery' | 'assistant' | 'admin';

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

  orderStatus: OrderStatusNameType;
  orderDate: string;
  merchant: Merchant;
  orderMerchant: Merchant;
  isMerchant: boolean;

  post: Post;
  slides: Slide[] = [];

  entityTemplate: EntityTemplate;
  entityTemplateLink: string;

  selectedTags: {
    [key: string]: boolean;
  } = {};
  selectedTagsLength: number;
  tags: Tag[];
  tagOptions: DropdownOptionItem[];
  tagPanelState: boolean;

  orderReadyToDeliver: boolean = false;
  orderDelivered: boolean = false;

  deliveryImages: Array<{
    image?: string;
    order: string;
  }> = [];

  deliveryForm = new FormGroup({
    image: new FormControl(),
  });

  swiperConfig: SwiperOptions = {
    slidesPerView: 1,
    freeMode: false,
    spaceBetween: 0,
    loop: false,
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
    private tagsService: TagsService,
    private entityTemplateService: EntityTemplateService,
    private clipboard: Clipboard,
    private snackBar: MatSnackBar,
    private _bottomSheet: MatBottomSheet,
    private ngNavigatorShareService: NgNavigatorShareService,
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(async (queryParams) => {
      const { redirectTo, view, orderId, deliveryZone } = queryParams;

      this.redirectTo = redirectTo;
      if (view) this.view = view;

      if (typeof redirectTo === 'undefined') this.redirectTo = null;

      this.route.params.subscribe(async (params) => {
        const { merchantId } = params;

        await this.executeProcessesAfterLoading(merchantId, orderId, deliveryZone);
        if (orderId) await this.getOrders(this.merchant._id, deliveryZone);

        this.orderReadyToDeliver = 
          (
            this.order.orderStatusDelivery === 'pending' || 
            this.order.orderStatusDelivery === 'delivered'
          );
      });
    });
  }

  async executeProcessesAfterLoading(merchantId: string, orderId?: string, deliveryZone?: string) {
    lockUI();

    

    this.merchant = await this.merchantsService.merchant(merchantId);

    if (!orderId) {
      await this.getOrders(this.merchant._id, deliveryZone);
      this.order = (await this.orderService.order(this.ordersReadyToDeliver[0]._id))?.order;
    } else this.order = (await this.orderService.order(orderId))?.order;

    if (!this.order) {
      unlockUI();
      this.router.navigate([`others/error-screen/`], {
        queryParams: { type: 'order' },
      });
      return;
    }

    this.ordersReadyToDeliver.forEach((order) => {
      this.deliveryImages.push({
        image: this.isPopulated(order) ? (order.deliveryData.image ? order.deliveryData.image : null) : null,
        order: order._id
      })
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

    if (this.post && this.slides.length > 0) {
      const results = await this.entityTemplateService.entityTemplateByReference(
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
        this.deliveryStatusOptions.push(
          {
            text: 'Listo para enviarse',
            value: 'pending',
            selected: false,
            hide: false,
          },
          {
            text: 'De camino a ser entregado',
            value: 'shipped',
            selected: false,
            hide: false,
          }
        );
        if (location.houseNumber) address += '#' + location.houseNumber + ', ';
        address += location.street + ', ';
        if (location.referencePoint) address += location.referencePoint + ', ';
        address += location.city + ', República Dominicana';
        if (location.note) address += ` (${location.note})`;
      } else {
        address += location.nickName;
        this.deliveryStatusOptions.push({
          text: 'Listo para pick-up',
          value: 'pickup',
          selected: false,
          hide: false,
        });
      }
    }
    this.deliveryStatusOptions.push({
      text: 'Entregado',
      value: 'delivered',
      selected: false,
      hide: false,
    });
    if (this.isMerchant) {
      this.handleStatusOptions(this.order.orderStatusDelivery);
    }

    let giftMessage = '';
    if (this.post?.from) giftMessage += 'De: ' + this.post.from + '\n';
    if (this.post?.targets?.[0]?.name)
      giftMessage += 'Para: ' + this.post.targets[0].name + '\n';
    if (this.post?.message) giftMessage += 'Mensaje: ' + this.post.message;

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

    if (this.order.deliveryData) {
      this.orderReadyToDeliver = true;
      this.orderDelivered = true;
      if (this.order.orderStatusDelivery !== 'delivered') {
        if (this.isMerchant) await this.changeOrderStatus('delivered');
        else if (this.view === 'assistant') await this.changeOrderStatusAuthless('delivered');
        else if (this.view === 'delivery') await this.changeOrderStatusAuthless('delivered');
      }
    }

    unlockUI();
  }

  async getOrders(merchantId: string, deliveryZone?: string) {
    try {
      const result = await this.orderService.orderByMerchantDelivery(
        {
          options: {
            limit: 20,
            sortBy: "createdAt:desc"
          },
          findBy: {
            merchant: merchantId,
            deliveryZone: deliveryZone,
            orderStatusDelivery: this.view === 'delivery' ? 'pending' : this.view === 'assistant' ? 'in progress' : this.isMerchant ? ['pending', 'in progress', 'delivered'] : null,
          }
        }
      );

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

  async isMerchantOwner(merchant: string) {
    this.orderMerchant = await this.merchantsService.merchantDefault();
    this.isMerchant = merchant === this.orderMerchant?._id;
  }

  async changeOrderStatus(value: OrderStatusDeliveryType) {
    this.order.orderStatusDelivery = value;
    this.handleStatusOptions(value);
    
    try {
      await this.orderService.orderSetStatusDelivery(value, this.order._id);
      if (value === 'pending')  this.orderReadyToDeliver = true;
      if (value === 'delivered') this.orderDelivered = true;
    } catch (error) {
      console.log(error);
    }
  }

  async changeOrderStatusAuthless(value: OrderStatusDeliveryType) {
    this.ordersReadyToDeliver[this.activeIndex].orderStatusDelivery = value;
    this.handleStatusOptions(value);
    
    try {
      await this.orderService.orderSetStatusDeliveryWithoutAuth(value, this.ordersReadyToDeliver[this.activeIndex]._id);
      if (value === 'pending')  this.orderReadyToDeliver = true;
      if (value === 'delivered') this.orderDelivered = true;
    } catch (error) {
      console.log(error);
    }
  }

  handleStatusOptions(value: OrderStatusDeliveryType) {
    this.deliveryStatusOptions.forEach((option) => {
      option.hide = option.value === value;
    });
  }

  goToPost() {
    this.router.navigate([
      '/qr/' +
      '/article-template/' +
      this.entityTemplate._id
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
    const bottomSheetRef = this._bottomSheet.open(LinksDialogComponent, {
      data: [
        {
          title: `Vista e interfaz con ${this.isMerchant ? 'toda la info' : 'la info limitada'} `,
          options: [
            {
              title: 'Ver como lo verá el visitante',
              callback: () => {
                this.router.navigate([
                  `/ecommerce/order-detail/${order._id}`,
                ],
                { queryParams: { redirectTo: this.router.url } });
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
              callback: () => this.downloadQr(order)
            },
          ],
        }
      ],
    });
  }

  async onImageInput(input: File) {
    if (this.view === 'delivery') {
      lockUI();
      this.deliveryForm.get('image').patchValue(input);
      try {
        const result = await this.orderService.updateOrderDeliveryData(
          { image: this.deliveryForm.get('image').value[0] },
          this.ordersReadyToDeliver[this.activeIndex]._id
        );

        this.deliveryImages.forEach(deliveryImage => {
          if (deliveryImage.order === result._id) deliveryImage.image = result.deliveryData.image;
        });

        await this.orderService.orderSetStatusDeliveryWithoutAuth('delivered', this.ordersReadyToDeliver[this.activeIndex]._id);

        this.ordersReadyToDeliver[this.activeIndex].orderStatusDelivery = 'delivered';
        this.orderReadyToDeliver = false;
        this.orderDelivered = true;
        unlockUI();
      } catch (error) {
        console.log(error);
        unlockUI();
      }
    }
  }

  async updateCurrentSlideData(event: any) {
    console.log("Cambiando de slide", event);
    console.log(event.activeIndex);

    this.activeIndex = event.activeIndex;   

    // TODO validar si el slide fue hacia adelante o atrás

    // NOTA: La función tiene await pero podría no tenerlo para hacer más smooth el infinite scroll
    await this.populateOrder(event.activeIndex, 3, true);

    if (this.ordersReadyToDeliver[this.activeIndex].deliveryData?.image) {
      this.orderReadyToDeliver = false;
      this.orderDelivered = true;
      if (this.ordersReadyToDeliver[this.activeIndex].orderStatusDelivery === 'pending') {
        await this.orderService.orderSetStatusDeliveryWithoutAuth('delivered', this.ordersReadyToDeliver[this.activeIndex]._id);
        this.ordersReadyToDeliver[this.activeIndex].orderStatusDelivery = 'delivered';
      }
    } else if (this.ordersReadyToDeliver[this.activeIndex].orderStatusDelivery === 'pending') {
      this.orderReadyToDeliver = true;
      this.orderDelivered = false;
    } else {
      this.orderReadyToDeliver = false;
      this.orderDelivered = false;
    }
  }

  isPopulated(order: ItemOrder): boolean {
    if (order.createdAt) return true;
    else return false
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
      console.log("adelante")
      for (let i = index; i < index + n; i++) {
        console.log(i);
        if (i < this.ordersReadyToDeliver.length) {
          if (!this.isPopulated(this.ordersReadyToDeliver[i])) {
            const order = (await this.orderService.order(this.ordersReadyToDeliver[i]._id))?.order;
            this.ordersReadyToDeliver.splice(i, 1, order);
            console.log(this.deliveryImages[i]);
            this.deliveryImages[i].image = order.deliveryData?.image ? order.deliveryData?.image : null;
            console.log(`Posición ${i} reemplazada`);
          } else {
            console.log(`Posición ${i} ya está populada`);
            continue;
          };
        } else {
          console.log("Array fuera de límite superior");
        }
      }
    } else {
      console.log("atrás");
      for (let i = index; i > index + n; i--) {
        if (i > 0) {
          if (!this.isPopulated(this.ordersReadyToDeliver[i])) {
            const order = (await this.orderService.order(this.ordersReadyToDeliver[i]._id))?.order;
            this.ordersReadyToDeliver.splice(i, 1, order);
            console.log(`Posición ${i} reemplazada`);
          } else continue;
        } else {
          console.log("Array fuera de límite inferior");
        }
      }
    }

    console.log(this.ordersReadyToDeliver);
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
    const parentElement = this.orderQrCode.nativeElement.querySelector('img').src;
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

}