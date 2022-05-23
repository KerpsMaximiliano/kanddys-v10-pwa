import { Component, OnInit, Input } from '@angular/core';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-merchant-info',
  templateUrl: './merchant-info.component.html',
  styleUrls: ['./merchant-info.component.scss']
})
export class MerchantInfoComponent implements OnInit {
  @Input() merchantImage: string;
  @Input() merchantName: string = 'Breakfast By Mage';
  @Input() direction: string = 'Direccion ID y CTA';
  @Input() whatsapp: string = 'WhatsApp ID y CTA';
  @Input() instagram: string = 'still yet';

  env: string = environment.assetsUrl;

  constructor() { }

  ngOnInit(): void {
  }

}
