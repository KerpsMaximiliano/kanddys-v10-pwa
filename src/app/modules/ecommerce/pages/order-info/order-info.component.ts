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
import { ItemOrder, ItemSubOrder } from 'src/app/core/models/order';
import { ImageViewComponent } from 'src/app/shared/dialogs/image-view/image-view.component';
import { ItemList } from 'src/app/shared/components/item-list/item-list.component';
import { CustomizerValue } from 'src/app/core/models/customizer-value';
import { StatusListComponent } from 'src/app/shared/dialogs/status-list/status-list.component';
import { ItemStatus } from 'src/app/shared/components/item-status/item-status.component';
import { Post } from 'src/app/core/models/post';
import { Merchant } from 'src/app/core/models/merchant';
moment.locale('es');

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
  status: 'verificado' | 'en revisión' | 'por confirmar' | 'completado';
  statusList: {
    status:
      | 'cancelled'
      | 'started'
      | 'verifying'
      | 'in progress'
      | 'to confirm'
      | 'completed'
      | 'error'
      | 'draft';
    name:
      | 'cancelado'
      | 'empezado'
      | 'verificando'
      | 'verificado'
      | 'en revisión'
      | 'por confirmar'
      | 'completado'
      | 'error';
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
  view: 'comprado' | 'escenarios' | 'reservacion' | 'personalizacion' | 'mensajeRegalo' | 'pago' | 'address';
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
  ngOnInit(): void {
    let localLastHour = new Date();
    let offset = localLastHour.getTimezoneOffset() / 60;
    //lockUI()
    this.route.params.subscribe((params) => {
      this.linkId = params.id;
      this.headerService.orderId = params.id;
      this.orderService.order(params.id).then((data) => {
        if (data != undefined) {
          if (data.order.itemPackage) this.existPackage = true;
          this.order = data.order;
          this.ruta = `user-contact-landing/${this.order.items[0].saleflow.merchant.owner._id}`;
          this.merchantId = data.order.items[0].saleflow._id;
          this.notifications = data.order.userNotifications;
          this.items = data.order.items;
          this.showHeader = this.headerService.fromOrderSales ? true : false;

          this.providerData = {
            headline: data.order.items[0].saleflow.headline,
            subheadline: data.order.items[0].saleflow.subheadline,
            image: data.order.items[0].saleflow.banner,

            socials: data.order.items[0].saleflow.social,
          };
          this.auth
            .me()
            .then(
              (user) =>
                (this.showNotificationButton =
                  user?._id === data.order.user._id)
            );
          if (data.order.orderStatus === 'in progress')
            this.status = 'en revisión';
          else if (data.order.orderStatus === 'to confirm')
            this.status = 'por confirmar';
          else if (data.order.orderStatus === 'completed')
            this.status = 'completado';
          // data.order.ocr.status.forEach((status) => {
          let name:
            | 'cancelado'
            | 'empezado'
            | 'verificando'
            | 'verificado'
            | 'en revisión'
            | 'por confirmar'
            | 'completado'
            | 'error';
          switch (data.order.orderStatus) {
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
            status: data.order.orderStatus,
            name,
          });
          // })
          const totalPrice = data.order.subtotals.reduce(
            (a, b) => a + b.amount,
            0
          );
          this.price = data.order.items[0].customizer
            ? Math.round((totalPrice * 1.18 + Number.EPSILON) * 100) / 100
            : totalPrice;
          let today = moment();
          let daysAgo = today.diff(data.order.createdAt, 'days');
          let timeAgo = 'Hoy';
          if (daysAgo > 0) timeAgo = 'Hace ' + daysAgo + ' dias';
          if (data.order.ocr) {
            this.tabsOptions.push('Pago');
            this.view = 'pago';
            this.totalPayed = this.price;
            this.ocrPayments = [
              {
                id: data.order.ocr._id,
                title: '$' + this.price.toLocaleString('en-US'),
                // subtitle: 'Verificado por '+'AliciaID',
                description: data.order.ocr.transactionCode
                  ? 'Ultimos 4 digitos ' +
                    data.order.ocr.transactionCode.toUpperCase()
                  : '',
                description2: timeAgo,
                image: data.order.ocr.image,
                eventImage: () => this.openImageModal(data.order.ocr.image),
                status: this.status,
                statusCallback: () => this.openStatusDialog(),
              },
            ];
          } else this.view = 'comprado';
          this.tabsOptions.push('Comprado');
          if (
            data.order.items[0].post
          ) this.tabsOptions.push('Mensaje');
          if (data.order.items[0].customizer)
            this.tabsOptions.push('Personalización');
          const hasItemExtra = data.order.items.find(
            (item) => item.itemExtra.length > 0
          );
          if (hasItemExtra) {
            this.tabsOptions.push('Sets');
            this.itemsExtra = hasItemExtra.itemExtra;
          }
          if (data.order.items[0].reservation) {
            this.tabsOptions.push('Reservación');
            this.titleTab = 'Horario de la sesión';
          }
          if (data.order.items[0].deliveryLocation) {
            if (
              data.order.items[0].saleflow.merchant._id ===
              '616a13a527bcf7b8ba3ac312'
            ) {
              this.tabsOptions.push('Lugar de la sesión');
              this.titleTab = 'Lugar de la sesión';
              this.fotodavitte = true;
            } else this.tabsOptions.push('Entrega');
            this.titleTab = 'Entrega';
          }
          this.phone = data.order.user.phone;
          this.headerService.orderId = data.order._id;
          this.id = data.order._id;
          this.dateId = this.formatID(data.order.dateId);

          this.delivery = data.order.items[0].deliveryLocation.googleMapsURL;
          this.image = data.order.items[0].item.images;
          this.name =
            String(data.order.user.name) !== 'null' && data.order.user.name
              ? data.order.user.name
              : 'usuario';
          this.merchantName = data.order.items[0].saleflow.headline;
          this.orderId = data.order._id;
          // this.date = `${moment(data.order.createdAt).format(
          //   'YYYY-MM-DD'
          // )} a las ${moment(data.order.createdAt).format('hh:mm A')}`;
          this.date = `${moment(data.order.createdAt).format(
            'LL'
          )} a las ${moment(data.order.createdAt).format('LT')}`;
          if (data.order.itemPackage) this.pago = data.order.itemPackage.price;
          this.createdAt = data.order.createdAt;

          // this.dateOfOrder = this.headerService.walletData.createdAt;

          this.showItem = {
            showArrow: true,
            imageUrls: [`${environment.assetsUrl}/bee-kanddy.png`],
          };
          for (let i = 0; i < data.order.items[0].item.params.length; i++) {
            if (
              data.order.items[0].item.params[i]._id ==
              data.order.items[0].params[0].param
            ) {
              this.paramValue =
                data.order.items[0].item.params[i].values[0].name;
              this.paramType = data.order.items[0].item.name;
            }
          }
          this.packItem = {
            showArrow: true,
            title: data.order.items[0].item.name,
            description: this.paramValue,
          };
          if (
            data.order.items[0].reservation &&
            data.order.items[0].reservation._id
          ) {
            this.reservation
              .getReservation(data.order.items[0].reservation._id)
              .then((data) => {
                let dateInfo = data.getReservation.date.from.split('-');
                let day = dateInfo[2].split('T')[0];
                let hour =
                  (
                    parseInt(dateInfo[2].split('T')[1].split(':')[0]) - offset
                  ).toString() + '00';
                let month;
                for (let i = 0; i < this.calendar.allFullMonths.length; i++) {
                  if (
                    parseInt(dateInfo[1]) - 1 ==
                    this.calendar.allFullMonths[i].id
                  ) {
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
                  this.formatHour(data.getReservation.date.from)),
                  (this.reservationItem = {
                    showArrow: true,
                    title: 'Fecha',
                    description: `El ${
                      this.days[
                        moment(data.getReservation.date.from).isoWeekday() + 1
                      ]
                    } ${day} de ${month}, ${this.formatHour(
                      data.getReservation.date.from
                    )}`,
                  });
                this.allDone = true;
              });
          }
          if (data.order.items[0].post) {
            this.posts.getPost(data.order.items[0].post._id).then((data) => {
              this.message = data.post;
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
            });
          }
          if (data.order.items[0].customizer) {
            this.dateId = '';
            this.customizerValueService
              .getCustomizerValue(data.order.items[0].customizer._id)
              .then((value) => {
                this.customizer = value;
                const printType =
                  data.order.items[0].item.params[0].values.find(
                    (value) =>
                      value._id === data.order.items[0].params[0].paramValue
                  )?.name;
                if (printType)
                  this.customizerDetails.push({
                    name: 'Tipo de impresión',
                    value: printType,
                  });

                const selectedQuality =
                  data.order.items[0].item.params[1].values.find(
                    (value) =>
                      value._id === data.order.items[0].params[1].paramValue
                  )?.name;
                if (selectedQuality)
                  this.customizerDetails.push({
                    name: 'Calidad de servilleta',
                    value: selectedQuality,
                  });

                const backgroundColor = value.backgroundColor.color.name;
                if (backgroundColor)
                  this.customizerDetails.push({
                    name: 'Color de fondo',
                    value: backgroundColor,
                  });

                if(value.texts.length) {
                  this.customizerDetails.push({
                    name: 'Texto',
                    value: value.texts.reduce((prev, curr) => prev + curr.text, ''),
                  });
                }

                let selectedTypography =
                  value.texts.length > 0 && value.texts[0].font;
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
                  value.texts.length && value.texts[0].color.name;
                const typographyColorName =
                  value.texts.length && value.texts[0].color.nickname;
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
                  value.stickers.length &&
                  value.stickers[0].svgOptions.color.name;
                const stickerColorName =
                  value.stickers.length &&
                  value.stickers[0].svgOptions.color.nickname;
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

                this.items[0].item.images[0] = value.preview;
                this.dateId = this.formatID(data.order.dateId);
              });
          }
          if (params.notification) {
            if (data.order.items[0].customizer) {
              let url = location.href.replace(`/${params.notification}`, '');
              const message = `https://wa.me/19188156444?text=Orden%20de%20${data.order.items[0].amount}%20servilletas,%20aquí%20el%20enlace:%20${url}`;
              window.open(message);
            } else {
              let url = location.href.replace(`/${params.notification}`, '');
              const message = `https://wa.me/19188156444?text=Orden%20de%20${data.order.items[0].amount}%20${data.order.items[0].item.name},%20aquí%20el%20enlace:%20${url}`;
              window.open(message);
            }
          }
        } else {
          this.router.navigate([`ecommerce/error-screen/`], {
            queryParams: { type: 'order' },
          });
        }
      });
      /* if (params.notification) {
        window.open(`https://wa.me/19188156444?text=Pedido%20de%20Foto%20Davitte`);
      } */
    });

    this.route.queryParams.subscribe(params => {
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
      'ecommerce/order-sales/' + this.headerService.fromOrderSales,
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
    this.router.navigate([`/ecommerce/user-contact-landing/${this.order.user._id}`]);
  }

  redirectToMegaphone() {
    this.router.navigate([`/ecommerce/megaphone-v3/${this.merchantId}`])
  }

  wichName(e) {
    if (e === 'Reservación') {
      this.view = 'reservacion';
      // this.reservacion = true;
      // this.address = false;
      // this.escenarios = false;
      // this.comprado = false;
      // this.personalizacion = false;
      // this.mensajeRegalo = false;
      // this.pagoView = false;
    } else if (e === 'Entrega') {
      this.view = 'address';
      // this.reservacion = false;
      // this.address = true;
      // this.escenarios = false;
      // this.comprado = false;
      // this.personalizacion = false;
      // this.mensajeRegalo = false;
      // this.pagoView = false;
    } else if (e === 'Sets') {
      this.view = 'escenarios';
      // this.reservacion = false;
      // this.address = false;
      // this.escenarios = true;
      // this.comprado = false;
      // this.personalizacion = false;
      // this.mensajeRegalo = false;
      // this.pagoView = false;
    } else if (e === 'Comprado') {
      this.view = 'comprado';
      // this.reservacion = false;
      // this.address = false;
      // this.escenarios = false;
      // this.comprado = true;
      // this.personalizacion = false;
      // this.mensajeRegalo = false;
      // this.pagoView = false;
    } else if (e === 'Personalización') {
      this.view = 'personalizacion';
      // this.reservacion = false;
      // this.address = false;
      // this.escenarios = false;
      // this.comprado = false;
      // this.personalizacion = true;
      // this.mensajeRegalo = false;
      // this.pagoView = false;
    } else if (e === 'Mensaje') {
      this.view = 'mensajeRegalo';
      // this.reservacion = false;
      // this.address = false;
      // this.escenarios = false;
      // this.comprado = false;
      // this.personalizacion = false;
      // this.mensajeRegalo = true;
      // this.pagoView = false;
    } else if (e === 'Pago') {
      this.view = 'pago';
      // this.reservacion = false;
      // this.address = false;
      // this.escenarios = false;
      // this.comprado = false;
      // this.personalizacion = false;
      // this.mensajeRegalo = false;
      // this.pagoView = true;
    } else if (e === 'Lugar de la sesión') {
      this.view = 'address';
      // this.reservacion = false;
      // this.address = true;
      // this.escenarios = false;
      // this.comprado = false;
      // this.personalizacion = false;
      // this.mensajeRegalo = false;
      // this.pagoView = false;
    }
  }
}
