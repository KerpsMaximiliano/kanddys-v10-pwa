import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { capitalize, formatID, isVideo } from 'src/app/core/helpers/strings.helpers';
import { playVideoOnFullscreen } from 'src/app/core/helpers/ui.helpers';
import { ItemOrder, OrderStatusDeliveryType } from 'src/app/core/models/order';
import { Reservation } from 'src/app/core/models/reservation';
import { OrderService } from 'src/app/core/services/order.service';
import { ReservationService } from 'src/app/core/services/reservations.service';
import { DialogService } from 'src/app/libs/dialog/services/dialog.service';
import { ImageViewComponent } from 'src/app/shared/dialogs/image-view/image-view.component';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-order-confirmation',
  templateUrl: './order-confirmation.component.html',
  styleUrls: ['./order-confirmation.component.scss']
})
export class OrderConfirmationComponent implements OnInit {

  order: ItemOrder;
  env: string = environment.assetsUrl;
  environment: string = environment.uri;

  imageFiles: string[] = ['image/png', 'image/jpg', 'image/jpeg', 'image/webp'];
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

  reservation: Reservation;
  messageLink: string;

  capitalize = capitalize;
  playVideoOnFullscreen = playVideoOnFullscreen;

  statusList: Array<{
    name: string;
  }> = [];
  activeStatusIndex: number;

  payment: number;
  isMobile:boolean = false;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private orderService: OrderService,
    private reservationService: ReservationService,
    private dialogService: DialogService,
    private translate: TranslateService
  ) {
    let language = navigator?.language ? navigator?.language?.substring(0, 2) : 'es';
      translate.setDefaultLang(language?.length === 2 ? language  : 'es');
      translate.use(language?.length === 2 ? language  : 'es');
   }

  ngOnInit(): void {
    const regex = /Mobi|Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i;
    this.isMobile = regex.test(navigator.userAgent);
    this.route.params.subscribe(async (params) => {
      const { orderId } = params;

      await this.executeProcessesAfterLoading(orderId);
    });
  }

  async executeProcessesAfterLoading(orderId: string) {

    // Getting order
    // If order is not found, redirect to error screen
    await this.getOrder(orderId);

    // Builds the delivery status array
    this.buildStatusList();

    // Fixes images URL when they have no https
    if (this.order?.items) this.fixImagesURL();

    // Gets the total payment amount
    this.payment = this.order.subtotals.reduce((a, b) => a + b.amount, 0);

    if (this.order?.items[0]?.reservation) await this.getReservation(this.order?.items[0]?.reservation._id);

    this.generateMessage();
  }

  private async getOrder(orderId: string) {
    try {
      const order = await this.orderService.order(orderId, false);
      if (order) this.order = order?.order;
    } catch (error) {
      console.log(error);
      this.router.navigate([`others/error-screen/`], {
        queryParams: { type: 'order' },
      });
      return;
    }
  }

  private async getReservation(reservationId: string) {
    try {
      const reservation = await this.reservationService.getReservation(reservationId);
      if (reservation) this.reservation = reservation;
    } catch (error) {
      console.log(error);
    }
  }

  private fixImagesURL() {
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

  goToWhatsapp() {
    window.location.href = this.messageLink;
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

  displayReservation(reservation: Reservation) {
    const fromDate = new Date(reservation.date.from);
    const untilDate = new Date(reservation.date.until);

    const day = fromDate.getDate();
    const weekday = fromDate.toLocaleString('es-MX', {
      weekday: 'long',
    });
    const month = fromDate.toLocaleString('es-MX', {
      month: 'long',
    });
    const time = `${this.formatHour(fromDate)} - ${this.formatHour(
      untilDate,
      reservation.breakTime
    )}`;

    return `el ${capitalize(weekday)} ${day} de ${capitalize(month)} entre ${time}`;
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

  buildStatusList() {
    const statusList: OrderStatusDeliveryType[] = ['in progress', 'delivered'];

    const location = this.order.items[0].deliveryLocation;

    if (location.street) {
      statusList.splice(1, 0, 'pending');
      statusList.splice(2, 0, 'shipped');
    } else statusList.splice(1, 0, 'pickup');

    for (const status of statusList) {
      this.statusList.push({
        name: this.orderService.orderDeliveryStatus(status),
      });
    }

    const orderStatuDelivery = this.order.orderStatusDelivery;

    this.activeStatusIndex = statusList.findIndex(
      (status) => status === orderStatuDelivery
    );
  }

  urlIsVideo(url: string) {
    return isVideo(url);
  }

  private generateMessage() {

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
    }${address}`;

    const phone =
      this.order.items[0].saleflow.merchant.receiveNotificationsMainPhone ?
      this.order.items[0].saleflow.merchant.owner.phone :
      this.order.items[0].saleflow.merchant.secondaryContacts.length > 0 ?
      this.order.items[0].saleflow.merchant.secondaryContacts[0] :
      `19188156444`;

    this.messageLink = `https://api.whatsapp.com/send?phone=${
      phone
    }&text=${encodeURIComponent(message)}`;
  }

  back() {
    return this.router.navigate(
      [`/ecommerce/order-detail/${this.order._id}`],
      {
        queryParams: {
          notify: true
        }
      }
    );
  }

}
