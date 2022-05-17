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

@Component({
  selector: 'app-item-detail',
  templateUrl: './item-detail.component.html',
  styleUrls: ['./item-detail.component.scss'],
})
export class ItemDetailComponent implements OnInit {
    imageFolder: string;
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
    this.imageFolder = environment.assetsUrl;

    const sub = this.appService.events
      .pipe(filter((e) => e.type === 'deleted-item'))
      .subscribe((e) => {
        this.ngOnInit();
        sub.unsubscribe();
      });
  }
  shopcart: boolean = true;
  whatsapp: boolean = true;
  myStore: boolean = true;
  priceLabel : string = '14,020.00';
  itemData: Item;
  saleflowId: string;
  ctaText: string = 'ADICIONAR AL CARRITO';

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      if (params.id) {
        this.items.item(params.id).then((data) => {
          this.itemData = data;
          const productData = this.header.getItems(this.saleflowId);

          if (productData.length > 0) {
            if (productData.some((item) => item._id === data._id))
              this.ctaText = 'QUITAR DEL CARRITO';
            else this.ctaText = 'ADICIONAR AL CARRITO';
          } else this.ctaText = 'ADICIONAR AL CARRITO';
        });
      }
      if (params.saleflow) {
        this.saleflowId = params.saleflow;
      }
    });
  }

  showItems() {
    this.dialog.open(ShowItemsComponent, {
      type: 'flat-action-sheet',
      props: { 
        headerButton: 'Ver mas productos',
        headerCallback: () => this.router.navigate([`ecommerce/megaphone-v3/${this.header.saleflow._id}`]),
        footerCallback: () => {
          this.saleflow.saleflow(this.saleflowId, true).then(data =>{
            console.log(data);
            for (let i = 0; i < data.saleflow.items.length; i++) {
              if (data.saleflow.items[i].item._id === this.itemData._id) {
                if (data.saleflow.items[i].customizer) {
                  this.router.navigate([`ecommerce/provider-store`])
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

  saveProduct() {
    console.log('here');

    this.header.storeOrderProduct(this.saleflowId, {
      item: this.itemData._id,
      amount: 1,
      saleflow: this.saleflowId,
    });
    this.header.storeItem(this.saleflowId, this.itemData);
    this.showItems();
    this.ngOnInit();
    //this.router.navigate(['/ecommerce/provider-store']);
    //this.router.navigate(['/ecommerce/megaphone-v3/' + this.saleflowId]);
  }

  back(){
    this.router.navigate(['/ecommerce/megaphone-v3/' + this.saleflowId]);
    //this.location.back();
  }
}
