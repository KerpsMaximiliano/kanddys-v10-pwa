import { Component, OnInit, Input } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { OrderService } from 'src/app/core/services/order.service';
import { ReservationService } from 'src/app/core/services/reservations.service';
import { CalendarService } from 'src/app/core/services/calendar.service';
import { Item } from 'src/app/core/types/item.types';
import { PostsService } from 'src/app/core/services/posts.service';
import { MerchantsService } from 'src/app/core/services/merchants.service';
import { HeaderService } from 'src/app/core/services/header.service';
import { formatDate, LocationStrategy } from '@angular/common';
import { CustomizerValueService } from 'src/app/core/services/customizer-value.service';
import { DialogService } from 'src/app/libs/dialog/services/dialog.service';
import { AuthService } from 'src/app/core/services/auth.service';
import { environment } from 'src/environments/environment';
//import { CreateTriviaComponent } from '../create-trivia/create-trivia.component';
//import { lockUI, unlockUI } from 'src/app/core/helpers/ui.helpers';
import * as moment from 'moment';
import 'moment/locale/es'; // without this line it didn't work
import {
  ItemOrder,
  ItemSubOrder,
  OrderStatusNameType,
  OrderStatusType,
} from 'src/app/core/models/order';
import { ImageViewComponent } from 'src/app/shared/dialogs/image-view/image-view.component';
import { ItemList } from 'src/app/shared/components/item-list/item-list.component';
import { CustomizerValue } from 'src/app/core/models/customizer-value';
import { StatusListComponent } from 'src/app/shared/dialogs/status-list/status-list.component';
import { ItemStatus } from 'src/app/shared/components/item-status/item-status.component';
import { Post } from 'src/app/core/models/post';
import { Merchant } from 'src/app/core/models/merchant';
moment.locale('es');

type ViewTypes =
  | 'comprado'
  | 'escenarios'
  | 'reservacion'
  | 'personalizacion'
  | 'mensajeRegalo'
  | 'pago'
  | 'address';

@Component({
  selector: 'app-order-info',
  templateUrl: './order-info.component.html',
  styleUrls: ['./order-info.component.scss'],
})
export class OrderInfoComponent implements OnInit {
  constructor(
    public orderService: OrderService,
    private route: ActivatedRoute,
    public reservation: ReservationService,
    public headerService: HeaderService,
    private calendar: CalendarService,
    private posts: PostsService,
    private router: Router,
    private merchantService: MerchantsService,
    private customizerValueService: CustomizerValueService,
    private dialog: DialogService,
    private location: LocationStrategy,
    private auth: AuthService
  ) {
    history.pushState(null, null, window.location.href);
    this.location.onPopState(() => {
      history.pushState(null, null, window.location.href);
    });
  }

  titleTab: string = '';
  showItem: Item;
  packItem: Item;
  reservationItem: Item;
  phone: string;
  id: string;
  linkId: string;
  price: number = 0;
  status: OrderStatusNameType;
  statusList: {
    status: OrderStatusType;
    name: OrderStatusNameType;
  }[] = [];
  paramValue: string;
  paramType: string;
  image: string[];
  merchantName: string;
  dateString: string;
  name: string;
  dateId: string;
  delivery: string;
  message: Post;
  createdAt: string;
  items: Array<ItemSubOrder>;
  itemsExtra = [];
  customizer: CustomizerValue;
  order: ItemOrder;
  tabsOptions = [];
  allDone: boolean;
  orderId: string;
  pago: number;
  view: ViewTypes;
  dateOfOrder: string;
  existPackage: boolean = false;
  notifications: boolean = true;
  showNotificationButton: boolean;
  ocrPayments: ItemStatus[] = [];
  totalPayed: number;

  days: string[] = [
    '',
    'Lunes',
    'Martes',
    'Miércoles',
    'Jueves',
    'Viernes',
    'Sábado',
    'Domingo',
  ];
  providerData: any = {};
  saleFlowId: string;
  headline: string;
  showHeader: boolean;
  date: string;
  fotodavitte: boolean = false;
  customizerDetails: { name: string; value: string }[] = [];
  isValidMessage: boolean = false;
  ruta: string;
  merchantId: string;
  isMerchantView: boolean = false;
  async ngOnInit(): Promise<void> {
    //lockUI()
    this.linkId = this.route.snapshot.paramMap.get('id');
    const notification = this.route.snapshot.paramMap.get('notification');
    this.headerService.orderId = this.linkId;
    const order = (await this.orderService.order(this.linkId))?.order;
    if (!order) {
      this.router.navigate([`others/error-screen/`], {
        queryParams: { type: 'order' },
      });
      return;
    }
    if (order.itemPackage) this.existPackage = true;
    this.order = order;
    this.ruta = `user-contact-landing/${this.order.items[0].saleflow.merchant.owner._id}`;
    this.merchantId = order.items[0].saleflow._id;
    this.notifications = order.userNotifications;
    this.items = order.items;
    this.showHeader = this.headerService.fromOrderSales ? true : false;

    this.providerData = {
      headline: order.items[0].saleflow.headline,
      subheadline: order.items[0].saleflow.subheadline,
      image: order.items[0].saleflow.banner,

      socials: order.items[0].saleflow.social,
    };
    const user = await this.auth.me()
    this.showNotificationButton = user?._id === order.user._id;
    if (order.orderStatus === 'in progress') this.status = 'en revisión';
    else if (order.orderStatus === 'to confirm') this.status = 'por confirmar';
    else if (order.orderStatus === 'completed') this.status = 'completado';
    // order.ocr.status.forEach((status) => {
    let name:
      | 'cancelado'
      | 'empezado'
      | 'verificando'
      | 'verificado'
      | 'en revisión'
      | 'por confirmar'
      | 'completado'
      | 'error';
    switch (order.orderStatus) {
      case 'cancelled':
        name = 'cancelado';
        break;
      case 'started':
        name = 'empezado';
        break;
      case 'verifying':
        name = 'verificando';
        break;
      case 'in progress':
        name = 'en revisión';
        break;
      case 'to confirm':
        name = 'por confirmar';
        break;
      case 'completed':
        name = 'completado';
        break;
      default:
        name = 'error';
    }
    this.statusList.push({
      status: order.orderStatus,
      name,
    });
    // })
    const totalPrice = order.subtotals.reduce((a, b) => a + b.amount, 0);
    this.price = order.items[0].customizer
      ? Math.round((totalPrice * 1.18 + Number.EPSILON) * 100) / 100
      : totalPrice;
    let today = moment();
    let daysAgo = today.diff(order.createdAt, 'days');
    let timeAgo = 'Hoy';
    if (daysAgo > 0) timeAgo = 'Hace ' + daysAgo + ' dias';
    if (order.ocr) {
      this.tabsOptions.push('Pago');
      this.view = 'pago';
      this.totalPayed = this.price;
      this.ocrPayments = [
        {
          id: order.ocr._id,
          title: '$' + this.price.toLocaleString('en-US'),
          // subtitle: 'Verificado por '+'AliciaID',
          description: order.ocr.transactionCode
            ? 'Ultimos 4 digitos ' + order.ocr.transactionCode.toUpperCase()
            : '',
          description2: timeAgo,
          image: order.ocr.image,
          eventImage: () => this.openImageModal(order.ocr.image),
          status: this.status,
          statusCallback: () => this.openStatusDialog(),
        },
      ];
    } else this.view = 'comprado';
    this.tabsOptions.push('Comprado');
    if (order.items[0].post) this.tabsOptions.push('Mensaje');
    if (order.items[0].customizer) this.tabsOptions.push('Personalización');
    const hasItemExtra = order.items.find((item) => item.itemExtra.length > 0);
    if (hasItemExtra) {
      this.tabsOptions.push('Sets');
      this.itemsExtra = hasItemExtra.itemExtra;
    }
    if (order.items[0].reservation) {
      this.tabsOptions.push('Reservación');
      this.titleTab = 'Horario de la sesión';
    }
    if (order.items[0].deliveryLocation) {
      if (order.items[0].saleflow.merchant._id === '616a13a527bcf7b8ba3ac312') {
        this.tabsOptions.push('Lugar de la sesión');
        this.titleTab = 'Lugar de la sesión';
        this.fotodavitte = true;
      } else this.tabsOptions.push('Entrega');
      this.titleTab = 'Entrega';
    }
    this.phone = order.user.phone;
    this.headerService.orderId = order._id;
    this.id = order._id;
    this.dateId = this.formatID(order.dateId);

    this.delivery = order.items[0].deliveryLocation?.googleMapsURL;
    this.image = order.items[0].item.images;
    this.name =
      String(order.user.name) !== 'null' && order.user.name
        ? order.user.name
        : 'usuario';
    this.merchantName = order.items[0].saleflow.headline;
    this.orderId = order._id;
    this.date = `${moment(order.createdAt).format('LL')} a las ${moment(
      order.createdAt
    ).format('LT')}`;
    if (order.itemPackage) this.pago = order.itemPackage.price;
    this.createdAt = order.createdAt;

    this.showItem = {
      showArrow: true,
      imageUrls: [`${environment.assetsUrl}/bee-kanddy.png`],
    };
    for (let i = 0; i < order.items[0].item.params.length; i++) {
      if (order.items[0].item.params[i]._id == order.items[0].params[0].param) {
        this.paramValue = order.items[0].item.params[i].values[0].name;
        this.paramType = order.items[0].item.name;
      }
    }
    this.packItem = {
      showArrow: true,
      title: order.items[0].item.name,
      description: this.paramValue,
    };
    if (order.items[0].reservation && order.items[0].reservation._id) {
      const reservation = await this.reservation.getReservation(
        order.items[0].reservation._id
      );
      let dateInfo = reservation.date.from.split('-');
      let day = dateInfo[2].split('T')[0];
      let month: string;
      for (let i = 0; i < this.calendar.allFullMonths.length; i++) {
        if (parseInt(dateInfo[1]) - 1 == this.calendar.allFullMonths[i].id) {
          month = this.calendar.allFullMonths[i].name;
        }
      }
      (this.dateString =
        'El ' +
        day +
        ' de ' +
        month +
        ' del ' +
        dateInfo[0] +
        ' a las ' +
        this.formatHour(reservation.date.from)),
        (this.reservationItem = {
          showArrow: true,
          title: 'Fecha',
          description: `El ${
            this.days[moment(reservation.date.from).isoWeekday() + 1]
          } ${day} de ${month}, ${this.formatHour(reservation.date.from)}`,
        });
      this.allDone = true;
    }
    if (order.items[0].post) {
      const post = (await this.posts.getPost(order.items[0].post._id)).post;
      this.message = post;
      if (
        !this.message.from &&
        !this.message.message &&
        this.message.targets.length &&
        !this.message.targets[0].name
      ) {
        const index = this.tabsOptions.indexOf('Mensaje');
        this.tabsOptions.splice(index, 1);
      } else {
        this.isValidMessage = true;
      }
    }
    if (order.items[0].customizer) {
      this.dateId = '';
      this.customizer = await this.customizerValueService.getCustomizerValue(
        order.items[0].customizer._id
      );
      const printType = order.items[0].item.params[0].values.find(
        (value) => value._id === order.items[0].params[0].paramValue
      )?.name;
      if (printType)
        this.customizerDetails.push({
          name: 'Tipo de impresión',
          value: printType,
        });

      const selectedQuality = order.items[0].item.params[1].values.find(
        (value) => value._id === order.items[0].params[1].paramValue
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

      this.items[0].item.images[0] = this.customizer.preview;
      this.dateId = this.formatID(order.dateId);
    }
    if (notification) {
      if (order.items[0].customizer) {
        let url = location.href.replace(`/${notification}`, '');
        const message = `https://wa.me/19188156444?text=Orden%20de%20${order.items[0].amount}%20servilletas,%20aquí%20el%20enlace:%20${url}`;
        window.open(message);
      } else {
        let url = location.href.replace(`/${notification}`, '');
        const message = `https://wa.me/19188156444?text=Orden%20de%20${order.items[0].amount}%20${order.items[0].item.name},%20aquí%20el%20enlace:%20${url}`;
        window.open(message);
      }
    }
    /* if (params.notification) {
        window.open(`https://wa.me/19188156444?text=Pedido%20de%20Foto%20Davitte`);
      } */

    this.route.queryParams.subscribe((params) => {
      const { viewtype } = params;
      if (viewtype === 'merchant') this.isMerchantView = true;
    });
  }

  openStatusDialog() {
    this.dialog.open(StatusListComponent, {
      type: 'fullscreen-translucent',
      props: {
        statusList: this.statusList,
      },
      customClass: 'app-dialog',
      flags: ['no-header'],
    });
  }

  formatID(dateId: string) {
    const splits = dateId.split('/');
    const year = splits[2].substring(0, 4);
    const number = splits[2].substring(4);
    const month = splits[0];
    const day = splits[1];
    return `#${year}${month}${day}${number}`;
  }

  formatHour(hour: string) {
    let date = moment(hour).local();
    let timeComponent = date.format('h:mm a');
    return timeComponent;
  }

  editCustomizer() {
    this.router.navigate([
      `posts/edit-customizer/${this.order._id}/${this.order.items[0].customizer._id}`,
    ]);
  }

  redirect() {
    this.router.navigate(['ecommerce/share/' + this.linkId]);
  }

  back() {
    this.router.navigate([
      'admin/order-sales/' + this.headerService.fromOrderSales,
    ]);
    this.headerService.fromOrderSales = undefined;
  }

  toggleNotifications() {
    this.orderService.toggleUserNotifications(!this.notifications, this.linkId);
    this.notifications = !this.notifications;
  }

  openImageModal(imageSourceURL: string) {
    this.dialog.open(ImageViewComponent, {
      type: 'fullscreen-translucent',
      props: {
        imageSourceURL,
      },
      customClass: 'app-dialog',
      flags: ['no-header'],
    });
  }

  redirectToUserContact() {
    this.router.navigate([
      `/others/user-contact-landing/${this.order.user._id}`,
    ]);
  }

  redirectToMegaphone() {
    this.router.navigate([`/ecommerce/store/${this.merchantId}`]);
  }

  wichName(e: string) {
    switch(e) {
      case 'Reservación': this.view = 'reservacion'; break;
      case 'Entrega': this.view = 'address'; break;
      case 'Sets': this.view = 'escenarios'; break;
      case 'Comprado': this.view = 'comprado'; break;
      case 'Personalización': this.view = 'personalizacion'; break;
      case 'Mensaje': this.view = 'mensajeRegalo'; break;
      case 'Pago': this.view = 'pago'; break;
      case 'Lugar de la sesión': this.view = 'address'; break;
    }
  }
}
