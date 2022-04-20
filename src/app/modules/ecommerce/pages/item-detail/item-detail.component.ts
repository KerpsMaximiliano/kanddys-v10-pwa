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
    private appService: AppService
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
          let productData = this.header.getItemProduct(this.saleflowId);
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
      props: { headerButton: 'Ver mas productos' },
      customClass: 'app-dialog',
      flags: ['no-header'],
    });
  }

  saveProduct(){
    console.log('here');
    
    this.header.storeItems(this.saleflowId, 
    {
      item: this.itemData._id,
      amount: 1,
      saleflow: this.saleflowId
    });
    this.header.storeItemProduct(this.saleflowId, this.itemData);
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
