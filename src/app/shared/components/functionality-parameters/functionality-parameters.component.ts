import { Component, OnInit } from '@angular/core';
import { SaleFlow } from 'src/app/core/models/saleflow';
import { MerchantsService } from 'src/app/core/services/merchants.service';
import { SaleFlowService } from 'src/app/core/services/saleflow.service';

@Component({
  selector: 'app-functionality-parameters',
  templateUrl: './functionality-parameters.component.html',
  styleUrls: ['./functionality-parameters.component.scss'],
})
export class FunctionalityParametersComponent implements OnInit {
  whatsapp: string = '(000) 000 - 0000';
  scenaries: number = 0;
  datesAndReservations: string = '3 slots disponibles cada 45 min';
  _module:any;
  constructor(
    private _SaleFlowService: SaleFlowService,
    private _MerchantsService: MerchantsService
  ) {}

  ngOnInit(): void {
    const getData = async () => {
      const { _id } = await this._MerchantsService.merchantDefault();
      const saleflow: SaleFlow = await this._SaleFlowService.saleflowDefault(_id);
      this._module = saleflow.module;
    };
    getData();
  }
}
