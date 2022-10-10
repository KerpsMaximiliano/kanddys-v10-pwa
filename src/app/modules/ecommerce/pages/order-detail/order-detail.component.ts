import { LocationStrategy } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { formatID } from 'src/app/core/helpers/strings.helpers';
import { CustomizerValue } from 'src/app/core/models/customizer-value';
import { ItemOrder, OrderStatusNameType } from 'src/app/core/models/order';
import { Post } from 'src/app/core/models/post';
import { CustomizerValueService } from 'src/app/core/services/customizer-value.service';
import { OrderService } from 'src/app/core/services/order.service';
import { PostsService } from 'src/app/core/services/posts.service';
import { ReservationService } from 'src/app/core/services/reservations.service';
import { DialogService } from 'src/app/libs/dialog/services/dialog.service';
import { ImageViewComponent } from 'src/app/shared/dialogs/image-view/image-view.component';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-order-detail',
  templateUrl: './order-detail.component.html',
  styleUrls: ['./order-detail.component.scss'],
})
export class OrderDetailComponent implements OnInit {
  env: string = environment.assetsUrl;
  notify: boolean;
  customizerDetails: { name: string; value: string }[] = [];
  customizer: CustomizerValue;
  order: ItemOrder;
  post: Post;
  payment: number;
  orderStatus: OrderStatusNameType;
  orderDate: string;
  date: {
    month: string;
    day: number;
    weekday: string;
    time: string;
  };
  messageLink: string;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private orderService: OrderService,
    private dialogService: DialogService,
    private postsService: PostsService,
    private customizerValueService: CustomizerValueService,
    private reservationService: ReservationService,
    private location: LocationStrategy
  ) {
    history.pushState(null, null, window.location.href);
    this.location.onPopState(() => {
      history.pushState(null, null, window.location.href);
    });
  }

  async ngOnInit(): Promise<void> {
    const notification = this.route.snapshot.queryParamMap.get('notify');
    const id = this.route.snapshot.paramMap.get('id');
    this.order = (await this.orderService.order(id))?.order;
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
    const day = temporalDate.getDate();
    const dayString = String(day).length < 2 ? '0' + day : day;
    const month = temporalDate.getMonth() + 1;
    const monthString = String(month).length < 2 ? '0' + month : month;
    const year = temporalDate.getFullYear();
    const yearString = String(year).length < 2 ? '0' + year : year;
    const hour = temporalDate.getHours();
    const hourString = String(hour).length < 2 ? '0' + hour : hour;
    const timeOfDay = hour < 12 ? 'AM' : 'PM';
    const minutes = temporalDate.getMinutes();
    const minutesString = String(minutes).length < 2 ? '0' + minutes : minutes;
    const seconds = temporalDate.getSeconds();
    const secondsString = String(seconds).length < 2 ? '0' + seconds : seconds;

    this.orderDate = `${dayString}/${monthString}/${year}, ${hourString}:${minutesString} ${timeOfDay}`;

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
    if (notification == 'true') {
      let address = '';
      const location = this.order.items[0].deliveryLocation;
      if (location.street) {
        if (location.houseNumber) address += '#' + location.houseNumber + ', ';
        address += location.street + ', ';
        if (location.referencePoint) address += location.referencePoint + ', ';
        address += location.city + ', República Dominicana';
        if (location.note) address += ` (${location.note})`;
      } else {
        address = location.nickName;
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

      const fullLink = `${environment.uri}/ecommerce/order-info/${this.order._id}`;
      const message = `*FACTURA ${formatID(
        this.order.dateId
      )} Y ARTÍCULOS COMPRADOS POR MONTO $${this.payment.toLocaleString(
        'es-MX'
      )}: ${fullLink}*\n\nComprador: ${
        this.order.user?.name ||
        this.order.user?.phone ||
        this.order.user?.email ||
        'Anónimo'
      }\n\nDirección: ${address}${
        giftMessage
          ? '\n\nMensaje en la tarjetita de regalo: \n' + giftMessage
          : ''
      }${customizerMessage ? '\n\nCustomizer:\n' + customizerMessage : ''}`;
      this.messageLink = `https://wa.me/${
        this.order.items[0].saleflow.merchant.owner.phone
      }?text=${encodeURIComponent(message)}`;
      this.notify = true;
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

  formatHour(date: Date, breakTime?: number) {
    if (breakTime) date = new Date(date.getTime() - breakTime * 60000);
    return date.toLocaleTimeString([], {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  }

  formatId(dateId: string) {
    return formatID(dateId);
  }

  redirectToUserContact = () => {
    this.router.navigate([
      `/others/user-contact-landing/${this.order.user._id}`,
    ]);
  };

  goToStore() {
    let link = this.order.items[0].saleflow._id;
    this.router.navigate([`ecommerce/store/${link}`]);
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
