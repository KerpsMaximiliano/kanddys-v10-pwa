import { Component, OnInit, Input } from '@angular/core';
import { SocialMediaModel } from 'src/app/core/models/saleflow';
import { DialogRef } from 'src/app/libs/dialog/types/dialog-ref';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-merchant-info',
  templateUrl: './merchant-info.component.html',
  styleUrls: ['./merchant-info.component.scss']
})
export class MerchantInfoComponent implements OnInit {
  @Input() merchantImage: string;
  @Input() merchantName: string;
  @Input() location: SocialMediaModel;
  @Input() whatsapp: SocialMediaModel;
  @Input() instagram: SocialMediaModel;

  env: string = environment.assetsUrl;

  constructor(
    private ref: DialogRef,
  ) { }

  ngOnInit(): void {
    if(this.whatsapp?.url) this.whatsapp.url = this.whatsapp.url.replace(/\D/g,'');
  }

  close() {
    this.ref.close();
  }

  goLink(url: string, type?:string) {
    if(type == 'whatsapp'){
      url = url.replace(/[^0-9]/g, '');
      console.log(url)
      const whatsappLink = `https://wa.me/+1${url}`;
      console.log(whatsappLink);
      window.open(whatsappLink, "_blank");
    } else if(type == 'email'){
      const emailAddress = `mailto:${url}`;
      console.log(emailAddress);
      window.location.href = emailAddress;
    }
  }

}
