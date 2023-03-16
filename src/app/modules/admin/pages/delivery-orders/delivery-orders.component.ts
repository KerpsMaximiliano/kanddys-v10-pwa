import { Component, OnInit } from '@angular/core';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-delivery-orders',
  templateUrl: './delivery-orders.component.html',
  styleUrls: ['./delivery-orders.component.scss']
})
export class DeliveryOrdersComponent implements OnInit {

  env: string = environment.assetsUrl;

  constructor() { }

  ngOnInit(): void {
  }

}
