import { Component, OnInit } from '@angular/core';
import { environment } from 'src/environments/environment';
import { ItemStatus } from 'src/app/shared/components/item-status/item-status.component';

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
  dummyPayments: ItemStatus[] = [{
    id: '1',
    title: '$500',
    description: 'Últimos 4 dígitos xxxx',
    description2: 'hace n dias',
    image: 'https://i.imgur.com/XDXsJhU.jpeg',
    status:'completado'},
    {
    id: '1',
    title: '$500',
    description: 'Últimos 4 dígitos xxxx',
    description2: 'hace n dias',
    image: 'https://i.imgur.com/XDXsJhU.jpeg',
    status:'verificado'},
    {
    id: '2',
    title: '$100',
    description: 'Últimos 4 dígitos xxxx',
    description2: 'hace n dias',
    image: 'https://i.imgur.com/XDXsJhU.jpeg',
    status:'en revisión'
    },
    {
    id: '3',
    title: '$120',
    description: 'Últimos 4 dígitos xxxx',
    description2: 'hace n dias',
    image: 'https://i.imgur.com/XDXsJhU.jpeg',
    status:'por confirmar'
    },
    {
    id: '4',
    title: '$250',
    description: 'Últimos 4 dígitos xxxx',
    description2: 'hace n dias',
    image: 'https://i.imgur.com/XDXsJhU.jpeg',
    status:'verificado'
    }];
  env: string = environment.assetsUrl;

  constructor() {}

  ngOnInit(): void {}

  togglePayments = () =>{
    this.payments = !this.payments;
  }
}
