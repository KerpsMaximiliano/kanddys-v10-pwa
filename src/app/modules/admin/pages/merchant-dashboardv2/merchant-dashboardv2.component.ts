import { Component, OnInit } from '@angular/core';
import { Merchant } from 'src/app/core/models/merchant';
import { SaleFlow } from 'src/app/core/models/saleflow';
import { AuthService } from 'src/app/core/services/auth.service';
import { MerchantsService } from 'src/app/core/services/merchants.service';
import { SaleFlowService } from 'src/app/core/services/saleflow.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-merchant-dashboardv2',
  templateUrl: './merchant-dashboardv2.component.html',
  styleUrls: ['./merchant-dashboardv2.component.scss']
})
export class MerchantDashboardv2Component implements OnInit {
  storeName: string = 'Mi Tienda';
  descText: string = 'Sirve para vender online a través del link (úsalo en tu WhatsApp y cuentas sociales).';
  collabTitle: string = 'Mis Colaboraciones';
  collabText: string = 'Se utiliza para tener responsabilidad social e incrementar las ventas apoyando causas de comunidades.';
  env: string = environment.assetsUrl;
  isLogged: boolean;
  merchantInfo: Merchant;
  saleflowInfo: SaleFlow;

  constructor(
    private authService: AuthService,
    private merchantService: MerchantsService,
    private saleflowService: SaleFlowService,
  ) {}

  ngOnInit(): void {
    this.authService.me().then(data =>{
      if(!data) return console.log('no estas logeado');
      this.isLogged = true;
      this.merchantService.myMerchants().then((merchants) => {
        if(!merchants || merchants.length === 0) return console.log('no hay merchants')
        this.merchantInfo = merchants[0];
        this.saleflowService.saleflows(merchants[0]._id, {}).then((saleflows) => {
          if(!saleflows || saleflows.length === 0) return console.log('no hay salrflows')
          this.saleflowInfo = saleflows[0];
        })
      })
    })
  }

}
