import { Component, Input, OnInit } from '@angular/core';
import { MyStoreService } from 'src/app/core/services/my-store.service';

@Component({
  selector: 'app-contact-buttons',
  templateUrl: './contact-buttons.component.html',
  styleUrls: ['./contact-buttons.component.scss'],
})
export class ContactButtonsComponent implements OnInit {
  @Input() socials: Array<any> = [];
  @Input() providerImage: string = '';
  @Input() objectFit:string = 'contain';
  mode: string;

  constructor(private storeService: MyStoreService) {
    this.mode = storeService.mode;
  }

  ngOnInit(): void {}

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
    }else{
      console.log('el Else'); 
    } 
  }
}
