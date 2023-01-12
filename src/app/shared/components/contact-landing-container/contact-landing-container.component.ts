import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { PaginationInput } from 'src/app/core/models/saleflow';
import { ContactService } from 'src/app/core/services/contact.service';
import { MerchantsService } from 'src/app/core/services/merchants.service';
import { UsersService } from 'src/app/core/services/users.service';

@Component({
  selector: 'app-contact-landing-container',
  templateUrl: './contact-landing-container.component.html',
  styleUrls: ['./contact-landing-container.component.scss']
})
export class ContactLandingContainerComponent implements OnInit {
  name:string;
  phone:string;
  email:string;
  bio:string;
  social:any;
  img:string;
  contactID:string;
  whatsapp:string;
  telegram:string;
  _phone:string;
  idUser:string;

  constructor(
    private _UsersService: UsersService,
    private _ActivatedRoute: ActivatedRoute,
    private _MerchantService: MerchantsService,
    private _ContactService: ContactService
  ) { }

  ngOnInit(): void {
    this._ActivatedRoute.params.subscribe(({ idUser }) => {
      (async () => {
        this.idUser = idUser;
        const _merchantDefault = await this._MerchantService.merchantDefault();
        if(idUser) {
          const { _id } = _merchantDefault;
          const paginate:PaginationInput = {
            findBy:{
              _id: idUser
            }
          }
          const [contact] = await this._ContactService.contacts(paginate);
          if(contact){
            const { name, description, link, image } = contact || {};
            this.contactID = name;
            this.img = image;
            this.bio = description;
            for(const { name, value } of link){
              switch(name){
                case 'whatsapp':
                  this.whatsapp = value;
                  break;
                case 'telegram':
                  this.telegram = value;
                  break;
                case 'phone':
                  this._phone = value;
                  break;
              }
            }
          }else{
            let {
              name,
              phone,
              email,
              bio,
              social,
              image,
              ...test
            } = (await this._UsersService.user(idUser)) || {
              social: []
            };
            this.contactID = name || phone || email;
            this.img = image;
            this.bio = bio;
            for(const { name,url } of social){
              switch(name){
                case 'whatsapp':
                  this.whatsapp = url;
                  break;
                case 'telegram':
                  this.telegram = url;
                  break;
                case 'phone':
                  this._phone = url;
                  break;
              }
            }
        }
      }
      })();
    })
  }

}
