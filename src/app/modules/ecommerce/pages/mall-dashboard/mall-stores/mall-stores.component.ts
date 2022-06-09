import { Component, OnInit } from '@angular/core';
import { ItemCategory } from 'src/app/core/models/item';
import { Merchant } from 'src/app/core/models/merchant';
import { MerchantsService } from 'src/app/core/services/merchants.service';
import { ItemList } from 'src/app/shared/components/item-list/item-list.component';

@Component({
  selector: 'app-mall-stores',
  templateUrl: './mall-stores.component.html',
  styleUrls: ['./mall-stores.component.scss']
})
export class MallStoresComponent implements OnInit {
  categories: ItemCategory[] = [];
  merchants: Merchant[] = [];
  merchantList: ItemList[] = [];

  constructor(
    private merchantsService: MerchantsService,
  ) { }

  async ngOnInit(): Promise<void> {
    this.merchants = await this.merchantsService.merchants();
    this.merchantList = this.merchants
    // .filter((merchant) => merchant.active)
    .map((merchant) => ({
      title: merchant.name,
      image: merchant.image,
      description: merchant.bio,
    }));
  }

}
