import { Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Merchant } from 'src/app/core/models/merchant';
import { User } from 'src/app/core/models/user';
import { AuthService } from 'src/app/core/services/auth.service';
import { MerchantsService } from 'src/app/core/services/merchants.service';
import { OrderService } from 'src/app/core/services/order.service';
import { TagsService } from 'src/app/core/services/tags.service';
import { Tag } from '../../../../core/models/tags';

const dummyTags = [ {
  messageNotify: 'prueba Nº1',
  counter: 3,
  name: 'Prueba Nº1 ',
  notify: true,
  user: 'patata',
  notifyUserOrder: true,
  notifyMerchantOrder: true,
  _id: 'skw45k10d21',
  createdAt: 'date',
  updatedAt: 'date'
},
{
  messageNotify: 'prueba Nº2',
  counter: 2,
  name: 'Prueba Nº2 ',
  notify: false,
  user: 'potat',
  notifyUserOrder: true,
  notifyMerchantOrder: true,
  _id: 'skw44k10d21',
  createdAt: 'date',
  updatedAt: 'date'
},
{
  messageNotify: 'prueba Nº3',
  counter: 33,
  name: 'Prueba Nº3 ',
  notify: true,
  user: 'apple',
  notifyUserOrder: true,
  notifyMerchantOrder: true,
  _id: 'skw46k10d21',
  createdAt: 'date',
  updatedAt: 'date'
},
{
  messageNotify: 'prueba Nº4',
  counter: 1,
  name: 'Prueba Nº4 ',
  notify: false,
  user: 'pear',
  notifyUserOrder: true,
  notifyMerchantOrder: true,
  _id: 'skw47k10d21',
  createdAt: 'date',
  updatedAt: 'date'
},{
  messageNotify: 'prueba Nº5',
  counter: 1,
  name: 'Prueba Nº5 ',
  notify: true,
  user: 'pear',
  notifyUserOrder: true,
  notifyMerchantOrder: true,
  _id: 'skw47k10d22',
  createdAt: 'date',
  updatedAt: 'date'
},{
  messageNotify: 'prueba Nº6',
  counter: 1,
  name: 'Prueba Nº6 ',
  notify: false,
  user: 'pear',
  notifyUserOrder: true,
  notifyMerchantOrder: true,
  _id: 'skw47k10d23',
  createdAt: 'date',
  updatedAt: 'date'
},{
  messageNotify: 'prueba Nº7',
  counter: 1,
  name: 'Prueba Nº7 ',
  notify: true,
  user: 'pear',
  notifyUserOrder: true,
  notifyMerchantOrder: true,
  _id: 'skw47k10d24',
  createdAt: 'date',
  updatedAt: 'date'
},{
  messageNotify: 'prueba Nº8',
  counter: 1,
  name: 'Prueba Nº8 ',
  notify: false,
  user: 'pear',
  notifyUserOrder: true,
  notifyMerchantOrder: true,
  _id: 'skw47k10d25',
  createdAt: 'date',
  updatedAt: 'date'
},{
  messageNotify: 'prueba Nº9',
  counter: 1,
  name: 'Prueba Nº9 ',
  notify: true,
  user: 'pear',
  notifyUserOrder: true,
  notifyMerchantOrder: true,
  _id: 'skw47k10d26',
  createdAt: 'date',
  updatedAt: 'date'
},{
  messageNotify: 'prueba Nº10',
  counter: 1,
  name: 'Prueba Nº10 ',
  notify: false,
  user: 'pear',
  notifyUserOrder: true,
  notifyMerchantOrder: true,
  _id: 'skw47k10d27',
  createdAt: 'date',
  updatedAt: 'date'
},{
  messageNotify: 'prueba Nº11',
  counter: 1,
  name: 'Prueba Nº11 ',
  notify: true,
  user: 'pear',
  notifyUserOrder: true,
  notifyMerchantOrder: true,
  _id: 'skw47k10d28',
  createdAt: 'date',
  updatedAt: 'date'
},{
  messageNotify: 'prueba Nº12',
  counter: 1,
  name: 'Prueba Nº12',
  notify: false,
  user: 'pear',
  notifyUserOrder: true,
  notifyMerchantOrder: true,
  _id: 'skw47k10d29',
  createdAt: 'date',
  updatedAt: 'date'
},{
  messageNotify: 'prueba Nº13',
  counter: 1,
  name: 'Prueba Nº13 ',
  notify: true,
  user: 'pear',
  notifyUserOrder: true,
  notifyMerchantOrder: true,
  _id: 'skw47k10d30',
  createdAt: 'date',
  updatedAt: 'date'
},{
  messageNotify: 'prueba Nº14',
  counter: 1,
  name: 'Prueba Nº14 ',
  notify: false,
  user: 'pear',
  notifyUserOrder: true,
  notifyMerchantOrder: true,
  _id: 'skw47k10d31',
  createdAt: 'date',
  updatedAt: 'date'
},{
  messageNotify: 'prueba Nº15',
  counter: 1,
  name: 'Prueba Nº15 ',
  notify: true,
  user: 'pear',
  notifyUserOrder: true,
  notifyMerchantOrder: true,
  _id: 'skw47k10d32',
  createdAt: 'date',
  updatedAt: 'date'
},{
  messageNotify: 'prueba Nº16',
  counter: 1,
  name: 'Prueba Nº16 ',
  notify: false,
  user: 'pear',
  notifyUserOrder: true,
  notifyMerchantOrder: true,
  _id: 'skw47k10d33',
  createdAt: 'date',
  updatedAt: 'date'
},{
  messageNotify: 'prueba Nº17',
  counter: 1,
  name: 'Prueba Nº17 ',
  notify: true,
  user: 'pear',
  notifyUserOrder: true,
  notifyMerchantOrder: true,
  _id: 'skw47k10d34',
  createdAt: 'date',
  updatedAt: 'date'
},{
  messageNotify: 'prueba Nº18',
  counter: 1,
  name: 'Prueba Nº18 ',
  notify: false,
  user: 'pear',
  notifyUserOrder: true,
  notifyMerchantOrder: true,
  _id: 'skw47k10d35',
  createdAt: 'date',
  updatedAt: 'date'
},{
  messageNotify: 'prueba Nº19',
  counter: 1,
  name: 'Prueba Nº19 ',
  notify: true,
  user: 'pear',
  notifyUserOrder: true,
  notifyMerchantOrder: true,
  _id: 'skw47k10d36',
  createdAt: 'date',
  updatedAt: 'date'
},{
  messageNotify: 'prueba Nº20',
  counter: 1,
  name: 'Prueba Nº20 ',
  notify: false,
  user: 'pear',
  notifyUserOrder: true,
  notifyMerchantOrder: true,
  _id: 'skw47k10d37',
  createdAt: 'date',
  updatedAt: 'date'
},{
  messageNotify: 'prueba Nº21',
  counter: 1,
  name: 'Prueba Nº21 ',
  notify: true,
  user: 'pear',
  notifyUserOrder: true,
  notifyMerchantOrder: true,
  _id: 'skw47k10d38',
  createdAt: 'date',
  updatedAt: 'date'
},{
  messageNotify: 'prueba Nº22',
  counter: 1,
  name: 'Prueba Nº22 ',
  notify: false,
  user: 'pear',
  notifyUserOrder: true,
  notifyMerchantOrder: true,
  _id: 'skw47k10d39',
  createdAt: 'date',
  updatedAt: 'date'
},{
  messageNotify: 'prueba Nº23',
  counter: 1,
  name: 'Prueba Nº23 ',
  notify: true,
  user: 'pear',
  notifyUserOrder: true,
  notifyMerchantOrder: true,
  _id: 'skw47k10d40',
  createdAt: 'date',
  updatedAt: 'date'
},{
  messageNotify: 'prueba Nº24',
  counter: 1,
  name: 'Prueba Nº24 ',
  notify: false,
  user: 'pear',
  notifyUserOrder: true,
  notifyMerchantOrder: true,
  _id: 'skw47k10d1',
  createdAt: 'date',
  updatedAt: 'date'
}];

@Component({
  selector: 'app-tag-list',
  templateUrl: './tag-list.component.html',
  styleUrls: ['./tag-list.component.scss']
})
export class TagListComponent implements OnInit {
  user: User;
  merchant: Merchant;
  itemList: Tag[] = [];
  users: User[];
  ordersTotal: {
    total: number;
    length: number;
  };

  constructor(
    private authService: AuthService,
    private location: Location,
    private merchantsService: MerchantsService,
    private tagsService: TagsService,
    private ordersService: OrderService,
    private router: Router,
  ) { }

  async ngOnInit(): Promise<void> {
    const user = await this.authService.me();
    if(!user) this.location.back();
    this.itemList = await this.tagsService.tagsByUser();
    this.merchant = await this.merchantsService.merchantDefault();
    if(!this.merchant) return;
    await Promise.all([
      this.getOrderTotal(),
      this.getMerchantBuyers(),
    ]);
  }

  async getOrderTotal() {
    try {
      this.ordersTotal = await this.ordersService.ordersTotal(['in progress', 'to confirm', 'completed'], this.merchant._id);
    } catch (error) {
      console.log(error);
    }
  }

  async getMerchantBuyers() {
    try {
      this.users = await this.merchantsService.usersOrderMerchant(this.merchant._id);
    } catch (error) {
      console.log(error);
    }
  }

  touched(tag: Tag){
    this.router.navigate(['/webforms/tag-visitors-detail/'+ tag._id], {
      state: {
        tag
      }
    })
  }

}
