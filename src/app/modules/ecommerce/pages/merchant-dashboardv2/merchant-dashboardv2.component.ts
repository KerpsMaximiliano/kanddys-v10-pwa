import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-merchant-dashboardv2',
  templateUrl: './merchant-dashboardv2.component.html',
  styleUrls: ['./merchant-dashboardv2.component.scss']
})
export class MerchantDashboardv2Component implements OnInit {

    imageFolder: string;
    @Input() storeName: string = 'Mi Tienda';
    @Input() descText: string = 'Sirve para vender online a través del link (úsalo en tu WhatsApp y cuentas sociales).';
    @Input() collabTitle: string = 'Mis Colaboraciones';
    @Input() collabText: string = 'Se utiliza para tener responsabilidad social e incrementar las ventas apoyando causas de comunidades.';

  constructor() { 
      this.imageFolder = environment.assetsUrl;
  }

  ngOnInit(): void {
  }

}
