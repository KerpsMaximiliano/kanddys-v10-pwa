import { Component, OnInit } from '@angular/core';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-order-detail',
  templateUrl: './order-detail.component.html',
  styleUrls: ['./order-detail.component.scss'],
})
export class OrderDetailComponent implements OnInit {
  tagActive: boolean;
  payments: boolean = true;
  date: string;
  hour: string;
  address: string;
  message: string;
  to: string;
  from: string;
  price: number = 500;
  totalPayed: number = 500;
  env: string = environment.assetsUrl;

  constructor() {}

  ngOnInit(): void {}
}
