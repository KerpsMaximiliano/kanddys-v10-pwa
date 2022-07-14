import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MerchantsService } from 'src/app/core/services/merchants.service';

@Component({
  selector: 'app-entity-detail-metrics',
  templateUrl: './entity-detail-metrics.component.html',
  styleUrls: ['./entity-detail-metrics.component.scss']
})
export class EntityDetailMetricsComponent implements OnInit {
  saleflow = {
    name: 'Tienda Name ID',
    description: 'Dos lineas de descripcion ID',
    image: '',
  }

  constructor(
    private merchantsService: MerchantsService,
    private route: ActivatedRoute,
  ) { }

  ngOnInit(): void {
    this.route.params.subscribe(async params => {
      const merchant = await this.merchantsService.merchant(params.id);
      console.log(merchant);
      const items = await this.merchantsService.itemsByMerchant(params.id);
    })
  }

  onShareClick = () => {
    //
  }

  onPencilClick = () => {
    //
  }

}
