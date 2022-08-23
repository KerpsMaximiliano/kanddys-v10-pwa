import { Component, OnInit } from '@angular/core';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-order-detail',
  templateUrl: './order-detail.component.html',
  styleUrls: ['./order-detail.component.scss'],
})
export class OrderDetailComponent implements OnInit {
  tagActive: boolean;
  payment: number = 1450.00;
  date: string;
  hour: string;
  address: string;
  message: string;
  to: string;
  from: string;
  env: string = environment.assetsUrl;

  constructor() {}

  ngOnInit(): void {}

}
