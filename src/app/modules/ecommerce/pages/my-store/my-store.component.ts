import { Component, OnInit } from '@angular/core';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-my-store',
  templateUrl: './my-store.component.html',
  styleUrls: ['./my-store.component.scss']
})
export class MyStoreComponent implements OnInit {

  env: string = environment.assetsUrl;
  tapped: boolean = false;
  tagsData: Array<any> = [ '', '', '', ''];
  saleflowList: Array<any> = [{
    price: 0.00,
    image: ['https://i.imgur.com/SufVLiV.jpeg'],
    income: '0.00',
    quantity: '0',
    index2: '0'
}, {
    price: 1.00,
    image: ['https://i.imgur.com/SufVLiV.jpeg'],
    income: '0.00',
    quantity: '0',
    index2: '0'
}, {
    price: 2.00,
    image: ['https://i.imgur.com/SufVLiV.jpeg'],
    income: '0.00',
    quantity: '0',
    index2: '0'
}, {
    price: 3.00,
    image: ['https://i.imgur.com/SufVLiV.jpeg'],
    income: '0.00',
    quantity: '0',
    index2: '0'
}]; //DATA DUMMY
  constructor() { }

  ngOnInit(): void {
  }

  tapping(){
    this.tapped = !this.tapped;
  }
}
