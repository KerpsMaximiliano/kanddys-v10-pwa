import { Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AppService } from 'src/app/app.service';
import { formatID } from 'src/app/core/helpers/strings.helpers';
import { lockUI, unlockUI } from 'src/app/core/helpers/ui.helpers';
import { CustomizerValueInput } from 'src/app/core/models/customizer-value';
import { ItemOrderInput } from 'src/app/core/models/order';
import { PostInput } from 'src/app/core/models/post';
import { ReservationInput } from 'src/app/core/models/reservation';
import { DeliveryLocationInput } from 'src/app/core/models/saleflow';
import { User, UserInput } from 'src/app/core/models/user';
import { AuthService } from 'src/app/core/services/auth.service';
import { CustomizerValueService } from 'src/app/core/services/customizer-value.service';
import { HeaderService } from 'src/app/core/services/header.service';
import { OrderService } from 'src/app/core/services/order.service';
import { PostsService } from 'src/app/core/services/posts.service';
import { DialogService } from 'src/app/libs/dialog/services/dialog.service';
import { ImageViewComponent } from 'src/app/shared/dialogs/image-view/image-view.component';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-checkout',
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.scss'],
})
export class CheckoutComponent implements OnInit {
  customizerDetails: { name: string; value: string }[] = [];
  customizer: CustomizerValueInput;
  customizerPreview: {
    base64: string;
    filename: string;
    type: string;
  };
  order: ItemOrderInput;
  items: any[];
  post: PostInput;
  deliveryLocation: DeliveryLocationInput;
  reservation: ReservationInput;
  payment: number;
  hasPaymentModule: boolean;
  disableButton: boolean;
  currentUser: User;
  date: {
    month: string;
    day: number;
    weekday: string;
    time: string;
  };
  logged: boolean;
  env: string = environment.assetsUrl;
  constructor(
    private dialogService: DialogService,
    public headerService: HeaderService,
    private customizerValueService: CustomizerValueService,
    private postsService: PostsService,
    private orderService: OrderService,
    private appService: AppService,
    private location: Location,
    private router: Router,
    private route: ActivatedRoute,
    private authService: AuthService
  ) {}

  async setCustomizerPreview() {
    this.customizer =
      this.headerService.customizer ||
      this.headerService.getCustomizer(this.headerService.saleflow?._id);
    if (!this.customizer) return;
    this.customizerPreview = JSON.parse(localStorage.getItem('customizerFile'));
    this.items[0].images[0] = this.customizerPreview?.base64;
    this.payment =
      (this.items[0].qualityQuantity.price +
        this.order.products[0].amount *
          this.items[0].params[0].values[0].price) *
      1.18;
    // Customizer data table
    const printType = this.items[0].params[0].values.find(
      (value) => value._id === this.items[0].params[0].values[0]._id
    )?.name;
    if (printType)
      this.customizerDetails.push({
        name: 'Tipo de impresión',
        value: printType,
      });
    const selectedQuality = this.items[0].params[1].values.find(
      (value) => value._id === this.order.products[0].params[1].paramValue
    )?.name;
    if (selectedQuality)
      this.customizerDetails.push({
        name: 'Calidad de servilleta',
        value: selectedQuality,
      });
    const backgroundColor = this.customizer.backgroundColor.color.name;
    if (backgroundColor) {
      this.customizerDetails.push({
        name: 'Color de fondo',
        value: backgroundColor,
      });
    }
    if (this.customizer.texts.length) {
      this.customizerDetails.push({
        name: 'Texto',
        value: this.customizer.texts.reduce(
          (prev, curr) => prev + curr.text,
          ''
        ),
      });
      let selectedTypography = this.customizer.texts[0].font;
      switch (selectedTypography) {
        case 'Dorsa':
          selectedTypography = 'Empire';
          break;
        case 'Commercial-Script':
          selectedTypography = 'Classic';
          break;
      }
      if (selectedTypography) {
        this.customizerDetails.push({
          name: 'Nombre de tipografía',
          value: selectedTypography,
        });
      }
      const typographyColorCode = this.customizer.texts[0].color.name;
      const typographyColorName = this.customizer.texts[0].color.nickname;
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
    }
    if (this.customizer.stickers.length) {
      const stickerColorCode =
        this.customizer.stickers[0].svgOptions.color.name;
      const stickerColorName =
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
    }
  }

  async ngOnInit(): Promise<void> {
    const saleflowId = this.route.snapshot.paramMap.get('saleflowId');
    await this.headerService.fetchSaleflow(saleflowId);
    this.order = this.headerService.getOrder(this.headerService.saleflow._id);
    this.items = this.headerService.getItems(this.headerService.saleflow._id);
    this.post = this.headerService.getPost(this.headerService.saleflow._id);
    this.deliveryLocation = this.headerService.getLocation(
      this.headerService.saleflow._id
    );
    this.reservation = this.headerService.getReservation(
      this.headerService.saleflow._id
    ).reservation;
    this.headerService.checkoutRoute = null;
    this.setCustomizerPreview();
    if (this.reservation) {
      const fromDate = new Date(this.reservation.date.from);
      const untilDate = new Date(this.reservation.date.until);
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
          this.reservation.breakTime
        )}`,
      };
    }
    if (!this.customizer)
      this.payment = this.items?.reduce(
        (prev, curr) => prev + ('pricing' in curr ? curr.pricing : curr.price),
        0
      );
    if (this.headerService.saleflow?.module?.paymentMethod?.paymentModule?._id)
      this.hasPaymentModule = true;
    this.checkLogged();
  }

  editOrder(
    mode: 'item' | 'message' | 'address' | 'reservation' | 'customizer'
  ) {
    this.headerService.checkoutRoute = `ecommerce/${this.headerService.saleflow._id}/checkout`;
    switch (mode) {
      case 'item': {
        this.router.navigate(
          [`ecommerce/store/${this.headerService.saleflow._id}`],
          {
            replaceUrl: true,
          }
        );
        break;
      }
      case 'message': {
        this.router.navigate(
          [`ecommerce/${this.headerService.saleflow._id}/create-giftcard`],
          {
            replaceUrl: true,
          }
        );
        break;
      }
      case 'address': {
        this.router.navigate(
          [`ecommerce/${this.headerService.saleflow._id}/new-address`],
          {
            replaceUrl: true,
          }
        );
        break;
      }
      case 'reservation': {
        this.router.navigate([
          `ecommerce/${this.headerService.saleflow._id}/reservations/${this.headerService.saleflow.module.appointment.calendar._id}`,
        ]);
        break;
      }
      case 'customizer': {
        this.router.navigate(
          [
            `ecommerce/provider-store/${this.headerService.saleflow._id}/${this.items[0]._id}/quantity-and-quality`,
          ],
          {
            replaceUrl: true,
          }
        );
        break;
      }
    }
  }

  back = () => {
    this.location.back();
  };

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

    let result = date.toLocaleTimeString([], {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });

    if (result.includes('0:')) {
      result = result.replace('0:', '12:');
    }

    return result;
  }

  createOrder = async () => {
    this.disableButton = true;
    lockUI();
    const userInput = JSON.parse(
      localStorage.getItem('registered-user')
    ) as UserInput;
    if (!this.headerService.user && userInput) {
      const user = await this.authService.signup(
        {
          ...userInput,
          deliveryLocations: [this.deliveryLocation],
        },
        'none',
        null,
        false
      );
      localStorage.setItem('registered-user', JSON.stringify(user));
    }
    this.order.products[0].saleflow = this.headerService.saleflow._id;
    this.order.products[0].deliveryLocation = this.deliveryLocation;
    if (this.reservation) this.order.products[0].reservation = this.reservation;
    // ---------------------- Managing Customizer ----------------------
    if (this.customizer) {
      localStorage.removeItem('customizerFile');
      if (!this.customizer.preview) {
        const res: Response = await fetch(this.customizerPreview.base64);
        const blob: Blob = await res.blob();

        this.customizer.preview = new File(
          [blob],
          this.customizerPreview.filename,
          {
            type: this.customizerPreview.type,
          }
        );
      }
      const customizerId =
        await this.customizerValueService.createCustomizerValue(
          this.customizer
        );
      this.order.products[0].customizer = customizerId;
      this.headerService.customizer = null;
      this.headerService.customizerData = null;
    }
    // ++++++++++++++++++++++ Managing Customizer ++++++++++++++++++++++
    // ---------------------- Managing Post ----------------------------
    if (this.headerService.saleflow.module?.post) {
      const postResult = (await this.postsService.createPost(this.post))
        ?.createPost?._id;
      this.order.products[0].post = postResult;
    }
    // ++++++++++++++++++++++ Managing Post ++++++++++++++++++++++++++++
    try {
      let createdOrder: string;
      const anonymous = this.headerService.getOrderAnonymous(
        this.headerService.saleflow._id
      );
      if (this.headerService.user && !anonymous) {
        createdOrder = (await this.orderService.createOrder(this.order))
          .createOrder._id;
      } else {
        createdOrder = (await this.orderService.createPreOrder(this.order))
          ?.createPreOrder._id;
      }
      this.headerService.deleteSaleflowOrder(this.headerService.saleflow._id);
      this.headerService.resetIsComplete();
      this.headerService.orderId = createdOrder;
      this.headerService.currentMessageOption = undefined;
      this.headerService.post = undefined;
      this.appService.events.emit({ type: 'order-done', data: true });
      if (this.hasPaymentModule) {
        this.router.navigate(
          [`/ecommerce/payments/${this.headerService.orderId}`],
          {
            replaceUrl: true,
          }
        );
      } else {
        if (!this.headerService.user || anonymous) {
          this.router.navigate([`/auth/login`], {
            queryParams: {
              orderId: createdOrder,
              auth: anonymous && 'anonymous',
            },
          });
          return;
        }
        const fullLink = `/ecommerce/order-info/${createdOrder}`;
        const order = (await this.orderService.order(createdOrder)).order;
        let address = '';
        const location = order.items[0].deliveryLocation;
        if (location.street) {
          if (location.houseNumber)
            address += '#' + location.houseNumber + ', ';
          address += location.street + ', ';
          if (location.referencePoint)
            address += location.referencePoint + ', ';
          address += location.city + ', República Dominicana';
          if (location.note) address += ` (nota: ${location.note})`;
        } else {
          address = location.nickName;
        }
        let giftMessage = '';
        if (this.post?.from) giftMessage += 'De: ' + this.post.from + '\n';
        if (this.post?.targets?.[0]?.name)
          giftMessage += 'Para: ' + this.post.targets[0].name + '\n';
        if (this.post?.message) giftMessage += 'Mensaje: ' + this.post.message;
        const message = `*FACTURA ${formatID(
          order.dateId
        )} Y ARTÍCULOS COMPRADOS POR MONTO $${this.payment.toLocaleString(
          'es-MX'
        )}: ${fullLink}*\n\nComprador: ${
          this.headerService.user?.name ||
          this.headerService.user?.phone ||
          this.headerService.user?.email ||
          'Anónimo'
        }\n\nDirección: ${address}\n\n${
          giftMessage ? 'Mensaje en la tarjetita de regalo: ' + giftMessage : ''
        }`;
        this.router.navigate([fullLink], {
          replaceUrl: true,
        });
        window.location.href = message;
        return;
      }
      unlockUI();
    } catch (error) {
      console.log(error);
      unlockUI();
      this.disableButton = false;
    }
  };

  async checkLogged() {
    try {
      const anonymous = await this.headerService.getOrderAnonymous(
        this.headerService.saleflow._id
      );
      const registeredUser = JSON.parse(
        localStorage.getItem('registered-user')
      ) as User;
      if ((this.headerService.user || registeredUser) && !anonymous) {
        this.currentUser = this.headerService.user || registeredUser;
        this.logged = true;
      } else this.logged = false;
    } catch (e) {
      console.log(e);
      return;
    }
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
