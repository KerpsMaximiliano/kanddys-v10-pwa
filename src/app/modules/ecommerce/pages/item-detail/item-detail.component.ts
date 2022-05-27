import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ItemsService } from 'src/app/core/services/items.service';
import { Item } from '../../../../core/models/item';
import { HeaderService } from 'src/app/core/services/header.service';
import { ShowItemsComponent } from 'src/app/shared/dialogs/show-items/show-items.component';
import { DialogService } from 'src/app/libs/dialog/services/dialog.service';
import { Location } from '@angular/common';
import { AppService } from 'src/app/app.service';
import { filter } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { SaleFlowService } from 'src/app/core/services/saleflow.service';
import { MagicLinkDialogComponent } from 'src/app/shared/components/magic-link-dialog/magic-link-dialog.component';
import { copyText } from 'src/app/core/helpers/strings.helpers';
import { notification } from 'onsenui';
import { Subscription } from 'rxjs';
import { SwiperOptions } from 'swiper';
import { ImageViewComponent } from 'src/app/shared/dialogs/image-view/image-view.component';
import { SaleFlow } from 'src/app/core/models/saleflow';

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
    private location: Location,
    private appService: AppService,
    private saleflow: SaleFlowService
  ) {}
  boxTitle: string = '';
  boxText: string = '';
  shopcart: boolean = true;
  whatsapp: boolean = true;
  myStore: boolean = true;
  viewtype: 'merchant' | 'community' | 'preview';
  preamount: string = '20';
  priceLabel : number = 0.00;
  itemData: Item;
  saleflowData: SaleFlow;
  itemCartCTA: string = 'Al Carrito Para Comprarlo';
  inCart: boolean;
  whatsappLink: string = '';
  fullLink: string = '';
  showCartCallBack: () => void;
  itemCartAmount: number;
  env: string = environment.assetsUrl;
  deleteEvent: Subscription;
  swiperConfig: SwiperOptions = {
    slidesPerView: 'auto',
    freeMode: true,
    spaceBetween: 5,
  };

  ngOnInit(): void {
    this.route.params.subscribe(async (params) => {
      this.saleflowData = await this.header.fetchSaleflow(params.saleflow);
      if(!this.saleflowData) return new Error(`Saleflow doesn't exist`);
      this.itemData = await this.items.item(params.id);
      if(!this.itemData) return this.back();
      this.boxTitle = this.itemData.merchant?.name;
      this.boxText = this.itemData.description || this.itemData.name;
      this.priceLabel = this.itemData.pricing;
      if(this.itemData.images.length) this.openImageModal(this.itemData.images[0]);
      this.itemInCart();
      this.fullLink = `${this.saleflowData._id 
        ? `${environment.uri}/ecommerce/item-detail/${this.saleflowData._id}/${params.id}?viewtype=community`
        : `${environment.uri}/ecommerce/item-detail/${params.id}?viewtype=community`}`;
      this.generateWhatsappLink(this.itemData.merchant.owner.phone, this.itemData.merchant.name, this.fullLink);
      this.showCartCallBack = () => this.showItems();
    });

    this.route.queryParams.subscribe((params)=>{
        this.viewtype = params.viewtype;
        if (this.viewtype === 'merchant') this.viewtype = 'merchant'
        else if( this.viewtype === 'preview') this.viewtype = 'preview'
        else if (this.viewtype === 'community') this.viewtype = 'community'    
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
          this.saleflow.saleflow(this.saleflowData._id, true).then(data =>{
            for (let i = 0; i < data.saleflow.items.length; i++) {
              if (data.saleflow.items[i].item._id === this.itemData._id) {
                if (data.saleflow.items[i].customizer) {
                  this.router.navigate([`ecommerce/provider-store/${this.saleflowData._id}/${this.itemData._id}`])
                }else{
                  this.router.navigate(['/ecommerce/create-giftcard']);
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

  openMagicLinkDialog() {
    this.dialog.open(MagicLinkDialogComponent, {
      type: 'flat-action-sheet',
      props: {
        ids: {
          id: this.itemData._id
        }
      },
      customClass: 'app-dialog',
      flags: ['no-header'],
    });
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

  toggleActivateItem() {
    this.items.updateItem({
      status: this.itemData.status === 'disabled' ? 'active' : 'disabled'
    }, this.itemData._id).catch((error) => {
      console.log(error);
      this.itemData.status = this.itemData.status === 'disabled' ? 'active' : 'disabled';
    })
    this.itemData.status = this.itemData.status === 'disabled' ? 'active' : 'disabled';
  }

  generateWhatsappLink(phone: string, merchantName: string, link: string) {
    this.whatsappLink = `https://wa.me/${
        phone
      }?text=Hola%20${
        merchantName
      },%20me%20interesa%20este%20producto: \n${
        link
      }`;
  }

  back() {
    this.router.navigate([`/ecommerce/megaphone-v3/${this.saleflowData._id}`]);
  }

  async copyLink() {
    await copyText(this.fullLink);
    await notification.toast('Enlace copiado en el clipboard', { timeout: 2000 });
  }
}