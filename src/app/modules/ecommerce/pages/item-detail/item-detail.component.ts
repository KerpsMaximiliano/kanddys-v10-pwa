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
import { StoreShareComponent, StoreShareList } from 'src/app/shared/dialogs/store-share/store-share.component';

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
  deleteEvent: Subscription;
  whatsappLink: string = null;
  swiperConfig: SwiperOptions = {
    slidesPerView: 'auto',
    freeMode: true,
    spaceBetween: 5,
  };

  ngOnInit(): void {
    this.route.params.subscribe(async (params) => {
      this.saleflowData = await this.header.fetchSaleflow(params.saleflow);

      if(!this.saleflowData) return new Error(`Saleflow doesn't exist`);''
      this.itemData = await this.items.item(params.id);

      if(!this.itemData) return this.back();

      const whatsappMessage = encodeURIComponent(`Hola, tengo una pregunta sobre este producto: ${window.location.href}`);
      this.whatsappLink = `https://wa.me/${this.saleflowData.merchant.owner.phone}?text=${whatsappMessage}`;

      if(this.itemData.images.length && this.itemData.showImages) this.openImageModal(this.itemData.images[0]);
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

  itemInCart() {
    const productData = this.header.getItems(this.saleflowData._id);
    this.itemCartAmount = productData?.length;
    console.log(this.itemCartAmount);
    if (productData && productData.length > 0) {
      this.inCart = productData.some((item) => item._id === this.itemData._id);
    } else this.inCart = false;
  }

  showItems() {
    this.dialog.open(ShowItemsComponent, {
      type: 'flat-action-sheet',
      props: { 
        headerButton: 'Ver mas productos',
        headerCallback: () => this.back(),
        footerCallback: () => {
          this.saleflowService.saleflow(this.saleflowData._id, true).then(data =>{
            for (let i = 0; i < data.saleflow.items.length; i++) {
              if (data.saleflow.items[i].item._id === this.itemData._id) {
                if (data.saleflow.items[i].customizer) {
                  this.router.navigate([`ecommerce/provider-store/${this.saleflowData._id}/${this.itemData._id}`])
                }else{
                  if (this.saleflowData.module.post) this.router.navigate(['/ecommerce/create-giftcard']);
                  else this.router.navigate(['/ecommerce/shipment-data-form']);
                }
              }
            }
          })
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
    if(this.inCart) {
      this.saveProduct();
    } else {
      if(!this.saleflowData.canBuyMultipleItems) {
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

  openShareDialog() {
    const list: StoreShareList[] = [
      {
        title:  this.itemData.name || 'Comparte el producto',
        options: [
          {
            text: 'Copia el link',
            mode: 'clipboard',
            link: `https://kanddys.com/ecommerce/item-detail/${this.saleflowData._id}/${this.itemData._id}`
          },
          {
            text: 'Comparte el link',
            mode: 'share',
            link: `https://kanddys.com/ecommerce/item-detail/${this.saleflowData._id}/${this.itemData._id}`,
          },
        ]
      }
    ]
    this.dialog.open(StoreShareComponent, {
      type: 'fullscreen-translucent',
      props: {
        list
      },
      customClass: 'app-dialog',
      flags: ['no-header'],
    });
  }

  back() {
    this.router.navigate([`/ecommerce/megaphone-v3/${this.saleflowData._id}`]);
  }

  // tapping(){
  //     this.tapped = !this.tapped;
  // }
}