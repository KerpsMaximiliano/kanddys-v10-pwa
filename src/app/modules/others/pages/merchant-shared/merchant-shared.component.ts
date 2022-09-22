import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Item } from 'src/app/core/models/item';
import { Merchant } from 'src/app/core/models/merchant';
import { ItemsService } from 'src/app/core/services/items.service';

@Component({
  selector: 'app-merchant-shared',
  templateUrl: './merchant-shared.component.html',
  styleUrls: ['./merchant-shared.component.scss'],
})
export class MerchantSharedComponent implements OnInit {
  merchant: Merchant;
  items: Item[];
  status: 'active' | 'disabled';

  constructor(
    private route: ActivatedRoute,
    private itemsService: ItemsService
  ) {}

  async ngOnInit(): Promise<void> {
    const merchantId = this.route.snapshot.paramMap.get('merchantId');
    this.status = this.route.snapshot.queryParamMap.get('status') as
      | 'active'
      | 'disabled';

    const items = (await this.itemsService.itemsByMerchant(merchantId, true))
      .itemsByMerchant;
    if (this.status === 'active')
      this.items = items.filter((item) => item.status === 'active');
    else if (this.status === 'disabled')
      this.items = items.filter((item) => item.status === 'disabled');
    else this.items = items;
  }
}
