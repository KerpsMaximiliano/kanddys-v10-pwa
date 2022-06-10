import { Component, OnInit } from '@angular/core';
import { environment } from 'src/environments/environment'

@Component({
  selector: 'app-category-items-admin',
  templateUrl: './category-items-admin.component.html',
  styleUrls: ['./category-items-admin.component.scss']
})
export class CategoryItemsAdminComponent implements OnInit {

    tabs: string[]=['item']
    env: string = environment.assetsUrl
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

}
