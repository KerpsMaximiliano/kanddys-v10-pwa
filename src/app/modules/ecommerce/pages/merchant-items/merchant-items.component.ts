import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-merchant-items',
  templateUrl: './merchant-items.component.html',
  styleUrls: ['./merchant-items.component.scss']
})
export class MerchantItemsComponent implements OnInit {

  constructor() { }

  itemList: Array<any> = [{
    price: 0.00,
    quantity: 0
  },{
    price: 0.01,
    quantity: 0
  },{
    price: 0.02,
    quantity: 0
  },{
    price: 0.03,
    quantity: 0
  },{
    price: 0.04,
    quantity: 0
  },{
    price: 0.05,
    quantity: 0
  }];

  ngOnInit(): void {
  }

}
