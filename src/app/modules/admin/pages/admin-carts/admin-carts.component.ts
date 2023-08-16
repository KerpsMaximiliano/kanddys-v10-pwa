import { Component, OnInit } from '@angular/core';

import gql from 'graphql-tag';

import { MerchantsService } from 'src/app/core/services/merchants.service';
import { ItemsService } from 'src/app/core/services/items.service';
import { lockUI, unlockUI } from 'src/app/core/helpers/ui.helpers';
import { PaginationInput } from 'src/app/core/models/saleflow';
import { Item } from 'src/app/core/models/item';

@Component({
  selector: 'app-admin-carts',
  templateUrl: './admin-carts.component.html',
  styleUrls: ['./admin-carts.component.scss']
})
export class AdminCartsComponent implements OnInit {

  constructor(
    private merchantsService: MerchantsService,
    private itemsService: ItemsService,
  ) { }

  data = []
  findString = ""
  default_image = 'https://cdn-icons-png.flaticon.com/512/149/149071.png'
  searchType = "name";

  filterData() {
    if (this.searchType == "name") return this.data.filter(item => item?.merchant?.name.toLowerCase().indexOf(this.findString.toLowerCase()) >= 0)
    else if (this.findString.length) return this.data.filter(item => item?.items[0].saleflow.merchant.owner.phone == this.findString)
    else return this.data;
  }

  async generate() {
    lockUI()

    const {me: {_id}} = await this.merchantsService.getMe();
    console.log("merchant _id", _id)
    
    const pagenate: PaginationInput = {
      findBy: {
        user: _id,
        isCompleted: false
      },
      options: {
        limit: -1
      },
    };
    const {carts: {results}} = await this.merchantsService.getCarts(pagenate);
    const data : Array<Promise<any>> = results.map(async cart => {
      const pagination: PaginationInput = {
        findBy: {
          _id: {
            __in: ([] = cart.products.map(p => p.item._id)),
          },
        },
        options: {
          sortBy: 'createdAt:desc',
          limit: -1,
          page: 1,
        },
      };
      let listItems: Array<any> = [];
      listItems =(await this.itemsService.listItems(pagination))?.listItems;
      const {merchant} = listItems[0]
      console.log( {cart, merchant} )
      const item = { cart, merchant }
      return item
    })
    this.data = await Promise.all(data)
    console.log(this.data)
    unlockUI()
  }

  ngOnInit(): void {
    this.generate()
  }

}
