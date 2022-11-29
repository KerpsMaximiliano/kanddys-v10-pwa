import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';
import { AppService } from 'src/app/app.service';
import { ItemSubOrderInput } from 'src/app/core/models/order';
import { HeaderService } from 'src/app/core/services/header.service';
import { ItemsService } from 'src/app/core/services/items.service';
import { DialogService } from 'src/app/libs/dialog/services/dialog.service';
import { ImageViewComponent } from 'src/app/shared/dialogs/image-view/image-view.component';
import { ShowItemsComponent } from 'src/app/shared/dialogs/show-items/show-items.component';
import {
  StoreShareComponent,
  StoreShareList,
} from 'src/app/shared/dialogs/store-share/store-share.component';
import { environment } from 'src/environments/environment';
import { SwiperOptions } from 'swiper';
import { Item, ItemParamValue } from '../../../../core/models/item';

@Component({
  selector: 'app-item-detail',
  templateUrl: './item-detail.component.html',
  styleUrls: ['./item-detail.component.scss'],
})
export class ItemDetailComponent implements OnInit, OnDestroy {
  constructor(
    public itemsService: ItemsService,
    private route: ActivatedRoute,
    public headerService: HeaderService,
    private router: Router,
    private dialog: DialogService,
    private appService: AppService
  ) {}
  item: Item;
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
    this.route.params.subscribe(async ({ itemId }) => {
      if (!itemId) return this.previewItem();

      this.item = await this.itemsService.item(itemId);
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
        `Hola, tengo una pregunta sobre este producto: ${this.URI}/ecommerce/${this.headerService.saleflow._id}/item-detail/${this.item._id}`
      );
      this.whatsappLink = `https://wa.me/${this.headerService.saleflow.merchant.owner.phone}?text=${whatsappMessage}`;
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
      return this.router.navigate([`/admin/create-article`]);
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
    const productData = this.headerService.getItems();
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
    const products = this.headerService.getItems();
    products?.forEach((product) => {
      if (!product.params) {
        this.item.params[0].values.forEach((value) => {
          if (id != product._id && value._id == product._id) {
            this.headerService.removeItem(product._id);
            this.headerService.removeOrderProduct(product._id);
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
          this.router.navigate(
            [`/ecommerce/${this.headerService.saleflow._id}/store`],
            {
              replaceUrl: this.headerService.checkoutRoute ? true : false,
            }
          ),
        footerCallback: () => {
          if (this.headerService.checkoutRoute) {
            this.router.navigate([this.headerService.checkoutRoute], {
              replaceUrl: true,
            });
            return;
          }
          this.router.navigate([
            `/ecommerce/${this.headerService.saleflow._id}/checkout`,
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
    this.headerService.storeOrderProduct(product);
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
    this.headerService.storeItem(
      this.selectedParam ? itemParamValue : this.item
    );
    this.itemInCart();
    this.showItems();
  }

  openShareDialog = () => {
    if (this.previewMode) return;
    const list: StoreShareList[] = [
      {
        qrlink: `${this.URI}/ecommerce/${
          this.headerService.saleflow._id
        }/item-detail/${this.item._id}${
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
            link: `${this.URI}/ecommerce/${
              this.headerService.saleflow._id
            }/item-detail/${this.item._id}${
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
            link: `${this.URI}/ecommerce/${
              this.headerService.saleflow._id
            }/item-detail/${this.item._id}${
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
    if (!this.headerService.flowRoute) {
      this.headerService.flowRoute = localStorage.getItem('flowRoute');
    }

    if (this.previewMode) {
      if (this.item._id)
        return this.router.navigate([`/admin/create-article/${this.item._id}`]);
      else {
        if (!this.headerService.flowRoute)
          return this.router.navigate([`/admin/create-article`]);
        else return this.router.navigate([this.headerService.flowRoute]);
      }
    }
    if (this.selectedParam) {
      this.selectedParam = null;
      return;
    }
    this.itemsService.removeTemporalItem();
    this.router.navigate(
      [`/ecommerce/${this.headerService.saleflow._id}/store`],
      {
        replaceUrl: this.headerService.checkoutRoute ? true : false,
        queryParams: {
          startOnSnapshot: true,
        },
      }
    );
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
