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
import { ItemSubOrder } from 'src/app/core/models/order';
import { ImageViewComponent } from 'src/app/shared/dialogs/image-view/image-view.component';
moment.locale('es');

@Component({
  selector: 'app-order-info',
  templateUrl: './order-info.component.html',
  styleUrls: ['./order-info.component.scss'],
})
export class OrderInfoComponent implements OnInit {
  allDone: boolean;
  address: boolean = false;
  pagoView: boolean;

  constructor(
    public order: OrderService,
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
  status: string;
  paramValue: string;
  paramType: string;
  image: string[];
  merchantName: string;
  dateString: string;
  name: string;
  dateId: any;
  delivery: string;
  message: any;
  createdAt: string;
  items: Array<ItemSubOrder>;
  itemsExtra = [];
  customizer: {
    _id: string;
    preview: string;
  };
  orders: any;
  socialNetworks: Array<any> = [
    {
      iconURL:
        'https://www.google.com/url?sa=i&url=https%3A%2F%2Fcommons.wikimedia.org%2Fwiki%2FFile%3AInstagram_icon.png&psig=AOvVaw0ArCppgE0iVzFJbFsQEGxd&ust=1640235510141000&source=images&cd=vfe&ved=0CAsQjRxqFwoTCPDb88jP9vQCFQAAAAAdAAAAABAU',
      title: 'Instagram',
    },
    {
      iconURL:
        'https://www.google.com/url?sa=i&url=https%3A%2F%2Fcommons.wikimedia.org%2Fwiki%2FFile%3AFacebook_icon_2013.svg&psig=AOvVaw2nupuCg66y98_7IeNnv8_8&ust=1640235324298000&source=images&cd=vfe&ved=0CAsQjRxqFwoTCKjczKDP9vQCFQAAAAAdAAAAABAP',
      title: 'Facebook',
    },
    {
      iconURL:
        'https://www.google.com/url?sa=i&url=https%3A%2F%2Fwww.stickpng.com%2Fes%2Fimg%2Ficonos-logotipos-emojis%2Fcompanias-technologicas%2Flogo-twitter&psig=AOvVaw0xj9pmyhIEwasq8pZr-D8P&ust=1640235546152000&source=images&cd=vfe&ved=0CAsQjRxqFwoTCJifv9rP9vQCFQAAAAAdAAAAABAD',
      title: 'Twitter',
    },
    {
      iconURL:
        'https://www.google.com/url?sa=i&url=https%3A%2F%2Fwww.pngwing.com%2Fes%2Ffree-png-vllqm&psig=AOvVaw3sfwwI8qPeTQwTxFxwexDQ&ust=1640235565290000&source=images&cd=vfe&ved=0CAsQjRxqFwoTCLDYuOPP9vQCFQAAAAAdAAAAABAD',
      title: 'Tik Tok',
    },
  ];
  facturado: boolean;
  escenarios: boolean;
  reservacion: boolean;
  personalizacion: boolean;
  tabsOptions = [];
  mensajeRegalo: boolean;
  orderId: string;
  pago: number;
  comprado: string;
  dateOfOrder: string;
  existPackage: boolean = false;
  notifications: boolean = true;
  showNotificationButton: boolean;

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
  saleFlow: any;
  currentMessage: string;
  showHeader: boolean;
  date: any;

  ngOnInit(): void {
    let localLastHour = new Date();
    let offset = localLastHour.getTimezoneOffset() / 60;
    //lockUI()
    this.route.params.subscribe((params) => {
      this.linkId = params.id;
      this.headerService.orderId = params.id;
      this.order.order(params.id).then((data) => {
        if (data != undefined) {
          if (data.order.itemPackage) this.existPackage = true;
          this.orders = data.order;
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
                (this.showNotificationButton = user._id === data.order.user._id)
            );
          if (data.order.ocr) {
            this.tabsOptions.push('Pago');
            this.pagoView = true;
          } else this.facturado = true;
          this.tabsOptions.push('Lo Facturado');
          if (data.order.items[0].post) this.tabsOptions.push('Mensaje');
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
            this.tabsOptions.push('Entrega');
            this.titleTab = 'Entrega';
          }
          this.phone = data.order.user.phone;
          const totalPrice = data.order.subtotals.reduce(
            (a, b) => a + b.amount,
            0
          );
          this.price = data.order.items[0].customizer
            ? Math.round((totalPrice * 1.18 + Number.EPSILON) * 100) / 100
            : totalPrice;
          this.headerService.orderId = data.order._id;
          this.id = data.order._id;
          this.dateId = this.formatID(data.order.dateId);
          this.status = data.order.orderStatus;

          if (this.status === 'in progress') this.status = 'EN REVISIÓN';
          else if (this.status === 'to confirm') this.status = 'POR CONFIRMAR';
          else if (this.status === 'completed') this.status = 'COMPLETADO';

          this.delivery = data.order.items[0].deliveryLocation.googleMapsURL;
          this.image = data.order.items[0].item.images;
          this.name =
            String(data.order.user.name) !== 'null' && data.order.user.name
              ? data.order.user.name
              : '';
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
              this.currentMessage = this.message.message;
              if (this.message.from === '' && this.message.message === '') {
                for (let i = 0; i < this.tabsOptions.length; i++) {
                  if (this.tabsOptions[i] === 'Mensaje') {
                    this.tabsOptions.splice(i, 1);
                  }
                }
              }
            });
          }
          if (data.order.items[0].customizer) {
            this.dateId = '';
            this.customizerValueService
              .getCustomizerValuePreview(data.order.items[0].customizer._id)
              .then((value) => {
                this.customizer = value;
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
            queryParams: { type: 'item' },
          });
        }
      });
      /* if (params.notification) {
        window.open(`https://wa.me/19188156444?text=Pedido%20de%20Foto%20Davitte`);
      } */
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
      `posts/edit-customizer/${this.orders._id}/${this.orders.items[0].customizer._id}`,
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
    this.order.toggleUserNotifications(!this.notifications, this.linkId);
    // .then((result) => {
    //   console.log('Cambiaste las preferencias de notificaciones');
    //   console.log(result);
    // });

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

  wichName(e) {
    if (e === 'Reservación') {
      this.reservacion = true;
      this.address = false;
      this.escenarios = false;
      this.facturado = false;
      this.personalizacion = false;
      this.mensajeRegalo = false;
      this.pagoView = false;
    } else if (e === 'Entrega') {
      this.reservacion = false;
      this.address = true;
      this.escenarios = false;
      this.facturado = false;
      this.personalizacion = false;
      this.mensajeRegalo = false;
      this.pagoView = false;
    } else if (e === 'Sets') {
      this.reservacion = false;
      this.address = false;
      this.escenarios = true;
      this.facturado = false;
      this.personalizacion = false;
      this.mensajeRegalo = false;
      this.pagoView = false;
    } else if (e === 'Lo Facturado') {
      this.reservacion = false;
      this.address = false;
      this.escenarios = false;
      this.facturado = true;
      this.personalizacion = false;
      this.mensajeRegalo = false;
      this.pagoView = false;
    } else if (e === 'Personalización') {
      this.reservacion = false;
      this.address = false;
      this.escenarios = false;
      this.facturado = false;
      this.personalizacion = true;
      this.mensajeRegalo = false;
      this.pagoView = false;
    } else if (e === 'Mensaje') {
      this.reservacion = false;
      this.address = false;
      this.escenarios = false;
      this.facturado = false;
      this.personalizacion = false;
      this.mensajeRegalo = true;
      this.pagoView = false;
    } else if (e === 'Pago') {
      this.reservacion = false;
      this.address = false;
      this.escenarios = false;
      this.facturado = false;
      this.personalizacion = false;
      this.mensajeRegalo = false;
      this.pagoView = true;
    }
  }
}
