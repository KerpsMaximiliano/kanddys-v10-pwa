import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Item } from 'src/app/core/models/item';
import { HeaderService } from 'src/app/core/services/header.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-custom-item-detail',
  templateUrl: './custom-item-detail.component.html',
  styleUrls: ['./custom-item-detail.component.scss']
})
export class CustomItemDetailComponent implements OnInit {
  servilletasList: {
    _id: string,
    title: string,
    price: number,
    quantity: number,
  }[] = [];

  constructor(
    private header: HeaderService,
    private router: Router,
    private route: ActivatedRoute,
  ) { }

  ngOnInit(): void {
    // if(this.header.items[0] && this.header.items[0].params.length > 1) {
    //   this.servilletasList = (this.header.items[0] as Item).params[1].values.map((item) => ({
    //     _id: item._id,
    //     title: item.name,
    //     price: item.price + (item.quantity * this.header.items[0].params[0].values[0].price),
    //     quantity: item.quantity,
    //   }))
    // }
    if(this.header.items[0] && this.header.items[0].params.length > 1) {
      this.servilletasList = (this.header.items[0] as Item).params[1].values.map((item) => {
        const price = item.price + (item.quantity * this.header.items[0].params[0].values[0].price);
        return {
          _id: item._id,
          title: item.name,
          price: price + (price*0.18),
          quantity: item.quantity,
          image: item.image
        }
      })
    }

    this.route.queryParams.subscribe((queries) => {
      if(queries.quality >= 0) this.onClick(queries.quality);
    });
  }

  onClick(index: number) {
    const total = this.header.items[0].params[1].values[index].price + (this.header.items[0].params[1].values[index].quantity * this.header.items[0].params[0].values[0].price)
    this.header.items[0].total = total+(total*0.18);
    this.header.items[0].qualityQuantity = {
      price: this.header.items[0].params[1].values[index].price,
      quantity: this.header.items[0].params[1].values[index].quantity,
    };
    this.header.order.products[0].amount = this.header.items[0].params[1].values[index].quantity;
    this.header.emptyItems(this.header.saleflow._id);
    this.header.storeItem(this.header.saleflow._id, this.header.items[0]);
    if (this.servilletasList.length > 0) {
      this.header.order.products[0].params[1] = {
        param: (this.header.items[0] as Item).params[1]._id,
        paramValue: (this.header.items[0] as Item).params[1].values[index]._id,
      };
      if((this.header.items[0] as Item).params[1].values[index].name.includes('Color')) {
        if(
          (this.header.items[0].params[1].values[index].name === 'Linen Like Color' && this.header.items[0].category[0].name === 'Baño') ||
          (this.header.items[0].params[1].values[index].name === 'Dry Cotton Color (Líneas azules)' && this.header.items[0].category[0].name === 'Comidas')
        ) {
          this.header.paramHasImage = true;
          this.header.paramHasColor = false;
        }
        else {
          this.header.paramHasImage = false
          this.header.paramHasColor = true;
        }
      }
      else {
        this.header.paramHasImage = false
        this.header.paramHasColor = false;
      }
    }
    this.header.addParams(this.header.saleflow._id, this.header.order.products[0].params[1]);
    this.header.storeAmount(this.header.saleflow._id, this.header.order.products[0].amount);
    this.header.orderProgress.qualityQuantity = true;
    this.header.storeOrderProgress(this.header.saleflow._id);
    if (this.header.customizerData) this.header.customizerData = null;
    this.header.orderProgress.customizer = false;
    this.router.navigate([`ecommerce/provider-store/${this.header.saleflow._id}/${this.header.items[0]._id}/redirect-to-customizer`]);
  }

}