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
  styleUrls: ['./item-detail.component.scss']
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
      this.ngOnInit();
      sub.unsubscribe();
    });
  }

  itemData: Item;
  saleflowId: string;
  ctaText: string = 'AGREGAR AL CARRITO';

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      if (params.id) {
        this.items.item(params.id).then(data => {
          this.itemData = data;
          console.log(this.itemData);
          let productData = this.header.getItems(this.saleflowId);
          console.log(data);
          console.log(productData.length);
          
          if (productData.length > 0) {
            for (let i = 0; i < productData.length; i++) {
              console.log(productData[i]._id, this.itemData._id);
              
              if (productData[i]._id === this.itemData._id) {
                this.ctaText = 'QUITAR DEL CARRITO'
              }
            }
          }else{
            this.ctaText = 'AGREGAR AL CARRITO'
          }
        })
      }
      if (params.saleflow) {
        this.saleflowId = params.saleflow;
      }
    })
  }

  showItems() {
    this.dialog.open(ShowItemsComponent, {
      type: 'flat-action-sheet',
      props: { headerButton: 'Ver mas productos', callback: this.boundedPrintValue},
      customClass: 'app-dialog',
      flags: ['no-header'],
    });
  }

  saveProduct(){
    console.log('here');
    
    this.header.storeOrderProduct(this.saleflowId, 
    {
      item: this.itemData._id,
      amount: 1,
      saleflow: this.saleflowId
    });
    this.header.storeItem(this.saleflowId, this.itemData);
    this.showItems();
    this.ngOnInit();
    //this.router.navigate(['/ecommerce/provider-store']);
    //this.router.navigate(['/ecommerce/megaphone-v3/' + this.saleflowId]);
  }

  public boundedPrintValue = ()=>{
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
  }

  back(){
    this.router.navigate(['/ecommerce/megaphone-v3/' + this.saleflowId]);
    //this.location.back();
  }

}
