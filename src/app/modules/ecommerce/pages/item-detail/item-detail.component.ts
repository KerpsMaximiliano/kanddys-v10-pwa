import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ItemsService } from 'src/app/core/services/items.service';
import { Item } from '../../../../core/models/item';
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

@Component({
  selector: 'app-item-detail',
  templateUrl: './item-detail.component.html',
  styleUrls: ['./item-detail.component.scss'],
})
export class ItemDetailComponent implements OnInit, OnDestroy {
  constructor(
    public items: ItemsService,
    private route: ActivatedRoute,
    private header: HeaderService,
    private router: Router,
    private dialog: DialogService,
    private appService: AppService,
    private saleflowService: SaleFlowService
  ) {}
  itemData: Item;
  saleflowData: SaleFlow;
  inCart: boolean;
  showCartCallBack: () => void;
  itemCartAmount: number;
  env: string = environment.assetsUrl;
  URI: string = environment.uri;
  deleteEvent: Subscription;
  whatsappLink: string = null;
  swiperConfig: SwiperOptions = {
    slidesPerView: 'auto',
    freeMode: false,
    spaceBetween: 5,
  };
  previewMode: boolean;

  ngOnInit(): void {
    this.route.params.subscribe(async (params) => {
      if (!params.saleflow || !params.id) return this.previewItem();
      this.saleflowData = await this.header.fetchSaleflow(params.saleflow);
      if (!this.saleflowData) return new Error(`Saleflow doesn't exist`);

      this.itemData = await this.items.item(params.id);
      if (!this.itemData || this.itemData.status !== 'active')
        return this.back();

      const whatsappMessage = encodeURIComponent(
        `Hola, tengo una pregunta sobre este producto: ${this.URI}/ecommerce/item-detail/${this.saleflowData._id}/${this.itemData._id}`
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
    if (!this.items.temporalItem) {
      // this.header.flowRoute = this.router.url;

      return this.router.navigate([`/admin/create-item`]);
    }
    this.itemData = this.items.temporalItem;
    if (!this.itemData.images.length) this.itemData.showImages = false;
    this.previewMode = true;
  }

  itemInCart() {
    const productData = this.header.getItems(this.saleflowData._id);
    this.itemCartAmount = productData?.length;
    if (productData && productData.length > 0) {
      this.inCart = productData.some((item) => item._id === this.itemData._id);
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
                if (data.saleflow.items[i].item._id === this.itemData._id) {
                  if (this.saleflowData.module?.post)
                    this.router.navigate(['/ecommerce/create-giftcard']);
                  else if (this.saleflowData.module?.delivery)
                    this.router.navigate(['/ecommerce/shipment-data-form']);
                  else if (!this.header.orderId) {
                    lockUI();
                    const preOrderID = await this.header.newCreatePreOrder();
                    this.header.orderId = preOrderID;
                    unlockUI();
                    this.router.navigate([
                      `ecommerce/flow-completion-auth-less/${preOrderID}`,
                    ]);
                    this.header.createdOrderWithoutDelivery = true;
                  } else {
                    this.router.navigate([
                      `ecommerce/flow-completion-auth-less/${this.header.orderId}`,
                    ]);
                  }
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
    this.header.storeOrderProduct(this.saleflowData._id, {
      item: this.itemData._id,
      amount: 1,
      saleflow: this.saleflowData._id,
    });
    this.header.storeItem(this.saleflowData._id, this.itemData);
    this.itemInCart();
    this.showItems();
  }

  openShareDialog = () => {
    if (this.previewMode) return;
    const list: StoreShareList[] = [
      {
        qrlink: `${this.URI}/ecommerce/item-detail/${this.saleflowData._id}/${this.itemData._id}`,
        options: [
          {
            text: 'Copia el link',
            mode: 'clipboard',
            link: `${this.URI}/ecommerce/item-detail/${this.saleflowData._id}/${this.itemData._id}`,
          },
          {
            text: 'Comparte el link',
            mode: 'share',
            link: `${this.URI}/ecommerce/item-detail/${this.saleflowData._id}/${this.itemData._id}`,
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

      if (this.itemData._id)
        return this.router.navigate([
          `/admin/create-item/${this.itemData._id}`,
        ]);
      else return this.router.navigate([`/admin/create-item`]);
    }
    this.items.removeTemporalItem();
    this.router.navigate([`/ecommerce/store/${this.saleflowData._id}`]);
  }

  tapping = () => {
    if (this.previewMode) return;
    let url = this.whatsappLink;
    window.open(url, '_blank');
  };
}
