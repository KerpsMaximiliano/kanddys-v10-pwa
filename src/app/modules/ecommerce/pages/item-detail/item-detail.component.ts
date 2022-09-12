import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ItemsService } from 'src/app/core/services/items.service';
import { Item, ItemParamValue } from '../../../../core/models/item';
import { HeaderService } from 'src/app/core/services/header.service';
import { ShowItemsComponent } from 'src/app/shared/dialogs/show-items/show-items.component';
import { DialogService } from 'src/app/libs/dialog/services/dialog.service';
import { AppService } from 'src/app/app.service';
import { filter } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { SaleFlowService } from 'src/app/core/services/saleflow.service';
import { Subscription } from 'rxjs';
import { SwiperOptions } from 'swiper';
import { ImageViewComponent } from 'src/app/shared/dialogs/image-view/image-view.component';
import { SaleFlow } from 'src/app/core/models/saleflow';
import {
  StoreShareComponent,
  StoreShareList,
} from 'src/app/shared/dialogs/store-share/store-share.component';
import { lockUI, unlockUI } from 'src/app/core/helpers/ui.helpers';
import { ItemSubOrderInput } from 'src/app/core/models/order';

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
    private appService: AppService,
    private saleflowService: SaleFlowService
  ) {}
  item: Item;
  saleflowData: SaleFlow;
  inCart: boolean;
  showCartCallBack: () => void;
  itemCartAmount: number;
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
      if (this.item.params?.some((param) => param.values?.length))
        this.hasParams = true;

      const whatsappMessage = encodeURIComponent(
        `Hola, tengo una pregunta sobre este producto: ${this.URI}/ecommerce/item-detail/${this.saleflowData._id}/${this.item._id}`
      );
      this.whatsappLink = `https://wa.me/${this.saleflowData.merchant.owner.phone}?text=${whatsappMessage}`;
      this.itemInCart();
      this.showCartCallBack = () => this.showItems();
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
    if (!this.item.images.length) this.item.showImages = false;
    if (this.item.params?.some((param) => param.values?.length))
      this.hasParams = true;
    this.previewMode = true;
  }

  itemInCart() {
    const productData = this.header.getItems(this.saleflowData._id);
    this.itemCartAmount = productData?.length;
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

  showItems() {
    if (this.previewMode) return;
    this.dialog.open(ShowItemsComponent, {
      type: 'flat-action-sheet',
      props: {
        headerButton: 'Ver mas productos',
        headerCallback: () => this.back(),
        footerCallback: () => {
          this.saleflowService
            .saleflow(this.saleflowData._id, true)
            .then(async (data) => {
              for (let i = 0; i < data.saleflow.items.length; i++) {
                if (data.saleflow.items[i].item._id === this.item._id) {
                  if (this.saleflowData.module?.post)
                    this.router.navigate(['/ecommerce/create-giftcard']);
                  else if (this.saleflowData.module?.delivery)
                    this.router.navigate(['/ecommerce/new-address']);
                  else this.router.navigate([`/ecommerce/checkout`]);
                }
              }
            });
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

  onCartClick() {
    if (this.previewMode) return;
    if (this.inCart) {
      this.saveProduct();
    } else {
      if (!this.saleflowData.canBuyMultipleItems) {
        this.header.emptyOrderProducts(this.saleflowData._id);
        this.header.emptyItems(this.saleflowData._id);
      }
      this.saveProduct();
    }
  }

  saveProduct() {
    const product: ItemSubOrderInput = {
      item: this.item._id,
      amount: 1,
      saleflow: this.saleflowData._id,
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
        qrlink: `${this.URI}/ecommerce/item-detail/${this.saleflowData._id}/${this.item._id}`,
        options: [
          {
            text: 'Copia el link',
            mode: 'clipboard',
            link: `${this.URI}/ecommerce/item-detail/${this.saleflowData._id}/${this.item._id}`,
          },
          {
            text: 'Comparte el link',
            mode: 'share',
            link: `${this.URI}/ecommerce/item-detail/${this.saleflowData._id}/${this.item._id}`,
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
    if (this.previewMode) {
      // this.header.flowRoute = this.router.url;

      if (this.item._id)
        return this.router.navigate([`/admin/create-item/${this.item._id}`]);
      else return this.router.navigate([`/admin/create-item`]);
    }
    if (this.selectedParam) {
      this.selectedParam = null;
      return;
    }
    this.itemsService.removeTemporalItem();
    this.router.navigate([`/ecommerce/store/${this.saleflowData._id}`]);
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
