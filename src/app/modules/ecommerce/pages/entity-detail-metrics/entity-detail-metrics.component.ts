import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Item } from 'src/app/core/models/item';
import { Merchant } from 'src/app/core/models/merchant';
import { MerchantsService } from 'src/app/core/services/merchants.service';

@Component({
  selector: 'app-entity-detail-metrics',
  templateUrl: './entity-detail-metrics.component.html',
  styleUrls: ['./entity-detail-metrics.component.scss']
})
export class EntityDetailMetricsComponent implements OnInit {
  merchant: Merchant;
  items: Item[];

  constructor(
    private merchantsService: MerchantsService,
    private route: ActivatedRoute,
  ) { }

  ngOnInit(): void {
    this.route.params.subscribe(async params => {
      this.merchant = await this.merchantsService.merchant(params.id);
      this.items = (await this.merchantsService.itemsByMerchant(params.id)).itemsByMerchant;
    })
  }

  onShareClick = () => {
    //
  }

  onPencilClick = () => {
    //
  }

}
