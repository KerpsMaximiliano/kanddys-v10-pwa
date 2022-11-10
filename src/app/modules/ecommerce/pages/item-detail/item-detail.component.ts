import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ItemsService } from 'src/app/core/services/items.service';
import { Item, ItemParamValue } from '../../../../core/models/item';
import { HeaderService } from 'src/app/core/services/header.service';
import { ShowItemsComponent } from 'src/app/shared/dialogs/show-items/show-items.component';
import { DialogService } from 'src/app/libs/dialog/services/dialog.service';
import { AppService } from 'src/app/app.service';
import { filter } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { Subscription } from 'rxjs';
import { SaleFlow } from 'src/app/core/models/saleflow';
import {
  StoreShareComponent,
  StoreShareList,
} from 'src/app/shared/dialogs/store-share/store-share.component';
import { SwiperOptions } from 'swiper';
import { ItemSubOrderInput } from 'src/app/core/models/order';
import { ImageViewComponent } from 'src/app/shared/dialogs/image-view/image-view.component';

@Component({
  selector: 'app-item-detail',
  templateUrl: './item-detail.component.html',
  styleUrls: ['./item-detail.component.scss'],
})
export class ItemDetailComponent implements OnInit, OnDestroy {
  constructor(
    public itemsService: ItemsService,
    private route: ActivatedRoute,
    private header: HeaderService,
    private router: Router,
    private dialog: DialogService,
    private appService: AppService
  ) {}
  item: Item;
  saleflowData: SaleFlow;
  inCart: boolean;
  env: string = environment.assetsUrl;
  URI: string = environment.uri;
  hasParams: boolean;
  selectedParam: {
    param: number;
    value: number;
  };
  deleteEvent: Subscription;
  whatsappLink: string = null;
  swiperConfig: SwiperOptions = {
    slidesPerView: 'auto',
    freeMode: false,
    spaceBetween: 5,
  };
  previewMode: boolean;
  hasImage: boolean;

  ngOnInit(): void {
    this.route.params.subscribe(async (params) => {
      if (!params.saleflow || !params.id) return this.previewItem();
      this.saleflowData = await this.header.fetchSaleflow(params.saleflow);
      if (!this.saleflowData) return new Error(`Saleflow doesn't exist`);

      this.item = await this.itemsService.item(params.id);
      if (
        !this.item ||
        (this.item.status !== 'active' && this.item.status !== 'featured')
      )
        return this.back();

      this.hasImage = this.item.images?.length > 0;
      if (this.item.images.length > 1) {
        this.swiperConfig.pagination = {
          el: '.swiper-pagination',
          type: 'bullets',
          clickable: true,
        };
      }
      if (this.item.params?.some((param) => param.values?.length)) {
        this.hasParams = true;
        const param = this.route.snapshot.queryParamMap.get('param');
        const value = this.route.snapshot.queryParamMap.get('value');
        if (this.item.params[param]?.values[value]) {
          this.selectParamValue(+param, +value);
        }
      }

      const whatsappMessage = encodeURIComponent(
        `Hola, tengo una pregunta sobre este producto: ${this.URI}/ecommerce/item-detail/${this.saleflowData._id}/${this.item._id}`
      );
      this.whatsappLink = `https://wa.me/${this.saleflowData.merchant.owner.phone}?text=${whatsappMessage}`;
      this.itemInCart();
    });

    this.deleteEvent = this.appService.events
      .pipe(filter((e) => e.type === 'deleted-item'))
      .subscribe((e) => {
        this.itemInCart();
      });
  }

  ngOnDestroy() {
    this.deleteEvent.unsubscribe();
  }

  previewItem() {
    if (!this.itemsService.temporalItem)
      return this.router.navigate([`/admin/create-item`]);
    this.item = this.itemsService.temporalItem;
    if (this.item.images.length > 1) {
      this.swiperConfig.pagination = {
        el: '.swiper-pagination',
        type: 'bullets',
        clickable: true,
      };
    }
    if (!this.item.images?.length) this.item.showImages = false;
    this.hasImage = this.item.images?.length > 0;
    if (this.item.params?.some((param) => param.values?.length))
      this.hasParams = true;
    this.previewMode = true;
  }

  itemInCart() {
    const productData = this.header.getItems(this.saleflowData._id);
    if (productData?.length) {
      this.inCart = productData.some(
        (item) =>
          item._id === this.item._id ||
          item._id ===
            this.item.params?.[this.selectedParam?.param]?.values?.[
              this.selectedParam?.value
            ]?._id
      );
    } else this.inCart = false;
  }

  paramFromSameItem(id: string) {
    const products = this.header.getItems(
      this.header.saleflow?._id ?? this.header.getSaleflow()?._id
    );
    products?.forEach((product) => {
      if (!product.params) {
        this.item.params[0].values.forEach((value) => {
          if (id != product._id && value._id == product._id) {
            this.header.removeItem(this.saleflowData._id, product._id);
            this.header.removeOrderProduct(this.saleflowData._id, product._id);
          }
        });
      }
    });
    return;
  }

  showItems() {
    if (this.previewMode) return;
    this.dialog.open(ShowItemsComponent, {
      type: 'flat-action-sheet',
      props: {
        headerButton: 'Ver más productos',
        headerCallback: () =>
          this.router.navigate([`/ecommerce/store/${this.saleflowData._id}`], {
            replaceUrl: this.header.checkoutRoute ? true : false,
          }),
        footerCallback: () => {
          if (this.header.checkoutRoute) {
            this.router.navigate([this.header.checkoutRoute], {
              replaceUrl: true,
            });
            return;
          }
          if (this.header.saleflow.module?.post) {
            this.router.navigate([
              `/ecommerce/${this.header.saleflow._id}/create-giftcard`,
            ]);
            return;
          }
          if (this.header.saleflow.module?.appointment?.calendar?._id) {
            this.router.navigate([
              `/ecommerce/${this.header.saleflow._id}/reservations/${this.header.saleflow.module.appointment.calendar._id}`,
            ]);
            return;
          }
          if (this.header.saleflow.module?.delivery) {
            this.router.navigate([
              `/ecommerce/${this.header.saleflow._id}/new-address`,
            ]);
            return;
          }
          this.router.navigate([
            `/ecommerce/${this.header.saleflow._id}/checkout`,
          ]);
        },
      },
      customClass: 'app-dialog',
      flags: ['no-header'],
    });
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

  saveProduct() {
    const product: ItemSubOrderInput = {
      item: this.item._id,
      amount: 1,
    };
    if (this.selectedParam) {
      product.params = [
        {
          param: this.item.params[this.selectedParam.param]._id,
          paramValue:
            this.item.params[this.selectedParam.param].values[
              this.selectedParam.value
            ]._id,
        },
      ];
      const paramValue =
        this.item.params[this.selectedParam.param].values[
          this.selectedParam.value
        ]._id;
      this.paramFromSameItem(paramValue);
    }
    this.header.storeOrderProduct(this.saleflowData._id, product);
    const itemParamValue: ItemParamValue = this.selectedParam
      ? {
          ...this.item.params[this.selectedParam.param].values[
            this.selectedParam.value
          ],
          price:
            this.item.pricing +
            this.item.params[this.selectedParam.param].values[
              this.selectedParam.value
            ].price,
        }
      : null;

    this.appService.events.emit({
      type: 'added-item',
      data: this.item._id,
    });
    this.header.storeItem(
      this.saleflowData._id,
      this.selectedParam ? itemParamValue : this.item
    );
    this.itemInCart();
    this.showItems();
  }

  openShareDialog = () => {
    if (this.previewMode) return;
    const list: StoreShareList[] = [
      {
        qrlink: `${this.URI}/ecommerce/item-detail/${this.saleflowData._id}/${
          this.item._id
        }${
          this.selectedParam
            ? '?param=' +
              this.selectedParam.param +
              '&value=' +
              this.selectedParam.value
            : ''
        }`,
        options: [
          {
            text: 'Copia el link',
            mode: 'clipboard',
            link: `${this.URI}/ecommerce/item-detail/${this.saleflowData._id}/${
              this.item._id
            }${
              this.selectedParam
                ? '?param=' +
                  this.selectedParam.param +
                  '&value=' +
                  this.selectedParam.value
                : ''
            }`,
          },
          {
            text: 'Comparte el link',
            mode: 'share',
            link: `${this.URI}/ecommerce/item-detail/${this.saleflowData._id}/${
              this.item._id
            }${
              this.selectedParam
                ? '?param=' +
                  this.selectedParam.param +
                  '&value=' +
                  this.selectedParam.value
                : ''
            }`,
          },
        ],
      },
    ];
    this.dialog.open(StoreShareComponent, {
      type: 'fullscreen-translucent',
      props: {
        list,
      },
      customClass: 'app-dialog',
      flags: ['no-header'],
    });
  };

  back() {
    if (!this.header.flowRoute) {
      this.header.flowRoute = localStorage.getItem('flowRoute');
    }

    if (this.previewMode) {
      if (this.item._id)
        return this.router.navigate([`/admin/create-item/${this.item._id}`]);
      else {
        if (!this.header.flowRoute)
          return this.router.navigate([`/admin/create-item`]);
        else return this.router.navigate([this.header.flowRoute]);
      }
    }
    if (this.selectedParam) {
      this.selectedParam = null;
      return;
    }
    this.itemsService.removeTemporalItem();
    this.router.navigate([`/ecommerce/store/${this.saleflowData._id}`], {
      replaceUrl: this.header.checkoutRoute ? true : false,
      queryParams: {
        startOnSnapshot: true,
      },
    });
  }

  selectParamValue(param: number, value: number) {
    if (this.previewMode) return;
    this.selectedParam = {
      param,
      value,
    };
    if (this.item.params[param].values[value].image) this.hasImage = true;
    else this.hasImage = false;
    this.itemInCart();
  }

  tapping = () => {
    if (this.previewMode) return;
    let url = this.whatsappLink;
    window.open(url, '_blank');
  };
}
