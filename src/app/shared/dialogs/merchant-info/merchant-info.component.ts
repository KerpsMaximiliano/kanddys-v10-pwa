import { Component, OnInit, Input } from '@angular/core';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-merchant-info',
  templateUrl: './merchant-info.component.html',
  styleUrls: ['./merchant-info.component.scss']
})
export class MerchantInfoComponent implements OnInit {

    @Input() mercahntImage: string;
    @Input() merchantName: string = 'Breakfast By Mage';
    @Input() direccion: string = 'Direccion ID y CTA';
    @Input() whatsapp: string = 'WhatsApp ID y CTA';
    @Input() instagram: string = 'Instagram CTA';
    @Input() merchantSite: string = 'www.website.com'

    imageFolder: string;
  constructor() {
    this.imageFolder = environment.assetsUrl;
   }

  ngOnInit(): void {
  }

  redirect(){
      console.log('to redirect')
  }

}
