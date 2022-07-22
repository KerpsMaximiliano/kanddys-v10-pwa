import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Item } from 'src/app/core/models/item';

@Component({
  selector: 'app-merchant-orders',
  templateUrl: './merchant-orders.component.html',
  styleUrls: ['./merchant-orders.component.scss']
})
export class MerchantOrdersComponent implements OnInit {

    items: Item[];
    ordersTotal: {
        total: number;
        length: number;
    };
  constructor( private router: Router) { }

  ngOnInit(): void {
  }


  goToMetrics = () =>{
    this.router.navigate([`ecommerce/entity-detail-metrics`]);
  }
}
