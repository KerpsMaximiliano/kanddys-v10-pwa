import { Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AppService } from 'src/app/app.service';
import { CustomizerValueInput } from 'src/app/core/models/customizer-value';
import { Item } from 'src/app/core/models/item';
import { ItemOrderInput } from 'src/app/core/models/order';
import { PostInput } from 'src/app/core/models/post';
import { SaleFlow } from 'src/app/core/models/saleflow';
import { CustomizerValueService } from 'src/app/core/services/customizer-value.service';
import { HeaderService } from 'src/app/core/services/header.service';
import { OrderService } from 'src/app/core/services/order.service';
import { PostsService } from 'src/app/core/services/posts.service';
import { DialogService } from 'src/app/libs/dialog/services/dialog.service';
import { ImageViewComponent } from 'src/app/shared/dialogs/image-view/image-view.component';

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
  saleflow: SaleFlow;
  order: ItemOrderInput;
  items: Item[];
  post: PostInput;
  payment: number;
  date: {
    month: string;
    day: number;
    weekday: string;
    time: string;
  };
  constructor(
    private dialogService: DialogService,
    private headerService: HeaderService,
    private customizerValueService: CustomizerValueService,
    private postsService: PostsService,
    private orderService: OrderService,
    private appService: AppService,
    private location: Location,
    private router: Router
  ) {}

  async setCustomizerPreview() {
    this.customizer =
      this.headerService.customizer ||
      this.headerService.getCustomizer(this.saleflow?._id);
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
      let selectedTypography = this.customizer.texts[0].font;
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

  ngOnInit(): void {
    this.saleflow =
      this.headerService.saleflow || this.headerService.getSaleflow();
    this.order = this.headerService.getOrder(this.saleflow?._id);
    this.items = this.headerService.getItems(this.saleflow?._id);
    this.post =
      this.headerService.post ||
      this.headerService.getPost(
        this.headerService.saleflow?._id ||
          this.headerService.getSaleflow()?._id
      )?.data;
    this.setCustomizerPreview();
    if (this.order.products[0].reservation) {
      const fromDate = new Date(this.order.products[0].reservation.date.from);
      const untilDate = new Date(this.order.products[0].reservation.date.until);
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
          this.order.products[0].reservation.breakTime
        )}`,
      };
    }
    if (!this.customizer)
      this.payment = this.items?.reduce((prev, curr) => prev + curr.pricing, 0);
  }

  placeholder() {
    // console.log('placeholder');
  }

  back() {
    this.location.back();
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

  newCreatePreOrder = async () => {
    this.order.products.forEach((product) => {
      delete product.isScenario;
      delete product.limitScenario;
      delete product.name;
    });
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
    if (this.saleflow.module?.post) {
      const postResult = (await this.postsService.createPost(this.post))
        ?.createPost?._id;

      this.order.products.forEach((product) => {
        product.post = postResult;
      });
    }
    // ++++++++++++++++++++++ Managing Post ++++++++++++++++++++++++++++
    // ---------------------- Managing Delivery ----------------------------
    if (this.saleflow.module?.delivery) {
      this.order.products.forEach((product) => {
        product.deliveryLocation = this.order.products[0].deliveryLocation;
      });
    }
    // ++++++++++++++++++++++ Managing Delivery ++++++++++++++++++++++++++++
    try {
      const { createPreOrder } = await this.orderService.createPreOrder(
        this.order
      );
      this.headerService.deleteSaleflowOrder(this.saleflow._id);
      this.headerService.resetIsComplete();
      this.headerService.orderId = createPreOrder._id;
      this.headerService.currentMessageOption = undefined;
      this.headerService.post = undefined;
      this.headerService.locationData = undefined;
      this.appService.events.emit({ type: 'order-done', data: true });
      this.router.navigate([`/auth/login`], {
        queryParams: {
          orderId: createPreOrder._id,
        },
      });
    } catch (error) {
      console.log(error);
    }
  };

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
