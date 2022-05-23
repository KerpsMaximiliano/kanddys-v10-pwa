import { Component, OnInit } from '@angular/core';
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

@Component({
  selector: 'app-item-detail',
  templateUrl: './item-detail.component.html',
  styleUrls: ['./item-detail.component.scss'],
})
export class ItemDetailComponent implements OnInit {
  constructor(
    public items: ItemsService,
    private route: ActivatedRoute,
    private header: HeaderService,
    private router: Router,
    private dialog: DialogService,
    private location: Location,
    private appService: AppService,
    private saleflow: SaleFlowService
  ) {
    const sub = this.appService.events
      .pipe(filter((e) => e.type === 'deleted-item'))
      .subscribe((e) => {
        this.itemInCart();
        sub.unsubscribe();
      });
  }
  boxTitle: string = '';
  boxText: string = '';
  shopcart: boolean = true;
  whatsapp: boolean = true;
  myStore: boolean = true;
  viewtype: 'merchant' | 'community' | 'preview';
  preamount: string = '20';
  priceLabel : number = 0.00;
  itemData: Item;
  saleflowId: string;
  ctaText: string = 'ADICIONAR AL CARRITO';
  bgColor: string = "#27a2ff";
  whatsappLink: string = '';
  fullLink: string = '';
  showCartCallBack: any;
  env: string = environment.assetsUrl;

  ngOnInit(): void {
    this.route.params.subscribe(async (params) => {
      if (params.id) {
        await this.items.item(params.id).then((data) => {
          this.itemData = data;
          console.log(this.itemData);
          this.boxTitle = this.itemData.merchant.name;
          this.boxText = this.itemData.description || this.itemData.name;
          this.priceLabel = this.itemData.pricing;
          this.itemInCart();
        });
      }
      if (params.saleflow) {
        this.saleflowId = params.saleflow;
      }
      this.fullLink = `${this.saleflowId 
        ? `${environment.uri}/ecommerce/item-detail/${this.saleflowId}/${params.id}?viewtype=community`
        : `${environment.uri}/ecommerce/item-detail/${params.id}?viewtype=community`}`;
      this.generateWhatsappLink(this.itemData.merchant.owner.phone, this.itemData.merchant.name, this.fullLink);
      console.log(this.whatsappLink);
      this.showCartCallBack = () => this.showItems();
    });

    this.route.queryParams.subscribe((params)=>{
        this.viewtype = params.viewtype;
        if (this.viewtype === 'merchant') this.viewtype = 'merchant'
        else if( this.viewtype === 'preview') this.viewtype = 'preview'
        else if (this.viewtype === 'community') this.viewtype = 'community'    
    });
  }

  itemInCart() {
    const productData = this.header.getItems(this.saleflowId);
    if (productData && productData.length > 0) {
      if (productData.some((item) => item._id === this.itemData._id)) {
        this.ctaText = 'QUITAR DEL CARRITO';
        this.bgColor = "#FC2727";
      }
      else {
        this.ctaText = 'ADICIONAR AL CARRITO';
        this.bgColor = "#27a2ff";
      }
    } else {
      this.ctaText = 'ADICIONAR AL CARRITO';
      this.bgColor = "#27a2ff";
    }
  }

  showItems() {
    this.dialog.open(ShowItemsComponent, {
      type: 'flat-action-sheet',
      props: { 
        headerButton: 'Ver mas productos',
        headerCallback: () => this.router.navigate([`ecommerce/megaphone-v3/${this.header.saleflow?._id}`]),
        footerCallback: () => {
          this.saleflow.saleflow(this.saleflowId, true).then(data =>{
            for (let i = 0; i < data.saleflow.items.length; i++) {
              if (data.saleflow.items[i].item._id === this.itemData._id) {
                if (data.saleflow.items[i].customizer) {
                  this.router.navigate([`ecommerce/provider-store/${this.header.saleflow?._id}/${this.itemData._id}`])
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
    this.header.storeOrderProduct(this.saleflowId, {
      item: this.itemData._id,
      amount: 1,
      saleflow: this.saleflowId,
    });
    this.header.storeItem(this.saleflowId, this.itemData);
    this.showItems();
    this.itemInCart();
    //this.router.navigate(['/ecommerce/provider-store']);
    //this.router.navigate(['/ecommerce/megaphone-v3/' + this.saleflowId]);
  }

  toggleActivateItem() {
    this.items.updateItem({
      status: this.itemData.status === 'disabled' ? 'active' : 'disabled'
    }, this.itemData._id).then((response) => {
      console.log(response)
    }).catch((error) => {
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

  back(){
    this.router.navigate(['/ecommerce/megaphone-v3/' + this.saleflowId]);
    //this.location.back();
  }

  async copyLink() {
    await copyText(this.fullLink);
    await notification.toast('Enlace copiado en el clipboard', { timeout: 2000 });
  }
}