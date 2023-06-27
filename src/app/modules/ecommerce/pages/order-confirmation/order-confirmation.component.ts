import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { formatID } from 'src/app/core/helpers/strings.helpers';
import { ItemOrder } from 'src/app/core/models/order';
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

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private orderService: OrderService,
    private reservationService: ReservationService,
    private dialogService: DialogService
  ) { }

  ngOnInit(): void {
    this.route.params.subscribe(async (params) => {
      const { orderId } = params;

      await this.executeProcessesAfterLoading(orderId);
    });
  }

  async executeProcessesAfterLoading(orderId: string) {
    await this.getOrder(orderId);

    if (this.order?.items) this.fixImagesURL();

    if (this.order?.items[0]?.reservation) await this.getReservation(this.order?.items[0].reservation._id);

    this.generateMessage();
  }

  private async getOrder(orderId: string) {
    try {
      const order = await this.orderService.order(orderId);
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
    window.open(this.messageLink, '_blank');
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

  private generateMessage() {
    // const message = `*🐝 FACTURA ${formatID(
    //   this.order.dateId
    // )}* \n\nLink de lo facturado por $${this.payment.toLocaleString(
    //   'es-MX'
    // )}: ${fullLink}\n\n*Comprador*: ${
    //   this.order.user?.name ||
    //   this.order.user?.phone ||
    //   this.order.user?.email ||
    //   'Anónimo'
    // }${address}\n\n${
    //   giftMessage
    //     ? '\n\nMensaje en la tarjetita de regalo: \n' + giftMessage
    //     : ''
    // }`;

    // this.messageLink = `https://api.whatsapp.com/send?phone=${
    //   this.order.items[0].saleflow.merchant.owner.phone
    // }&text=${encodeURIComponent(message)}`;
  }

  back() {
    // TODO: Navigate to order-detail
  }

}
