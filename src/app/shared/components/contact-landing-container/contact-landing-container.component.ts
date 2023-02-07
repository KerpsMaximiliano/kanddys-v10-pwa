import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { merchantDefault } from 'src/app/core/graphql/merchants.gql';
import { Link } from 'src/app/core/models/contact';
import { PaginationInput } from 'src/app/core/models/saleflow';
import { ContactService } from 'src/app/core/services/contact.service';
import { MerchantsService } from 'src/app/core/services/merchants.service';
import { UsersService } from 'src/app/core/services/users.service';

@Component({
  selector: 'app-contact-landing-container',
  templateUrl: './contact-landing-container.component.html',
  styleUrls: ['./contact-landing-container.component.scss'],
})
export class ContactLandingContainerComponent implements OnInit {
  name: string;
  phone: string;
  email: string;
  bio: string;
  social: any;
  img: string;
  contactID: string;
  whatsapp: string;
  telegram: string;
  _phone: string;
  idUser: string;
  image: string;
  links: any[];
  contactDirection:string;

  constructor(
    private _UsersService: UsersService,
    private _ActivatedRoute: ActivatedRoute,
    private _MerchantService: MerchantsService,
    private _ContactService: ContactService
  ) {}

  ngOnInit(): void {
    this._ActivatedRoute.params.subscribe(({ idUser }) => {
      (async () => {
        this.idUser = idUser;
        let _merchantDefault = await this._MerchantService.merchantDefault();

        const { image } = _merchantDefault || {};
        this.image = image;

        // Lo de abajo está comentado por un merge conflict

        // const { _id } = _merchantDefault || {};
        // const paginate: PaginationInput = {
        //   findBy: {
        //     user: idUser,
        //   },
        //   options: {
        //     sortBy: 'updatedAt:desc',
        //     limit: -1
        //   }
        // };
        // const [contact] = await this._ContactService.contacts(paginate);
        // if (contact) {
        //   const { _id, name, description, link, image } = contact || {};
        //   this.contactID = name;
        //   this.img = image;
        //   this.bio = description;
        //   this.links = link;
        //   this.idUser = _id;
        //   const direction = link.find(({name, value}) =>  name==='location');
        //   this.contactDirection = direction?.value || '';
        // } else {
        //   let { name, phone, email, bio, social, image, ...test }: any =
        //     (await this._UsersService.user(idUser)) || {
        //       social: [],
        //     };
        //   const merchantDefault = await this._MerchantService.merchants({
        //     findBy: {
        //       owner: idUser,
        //       default: true,
        //     },
        //     options: {
        //       limit: 1,
        //     },
        //   });

        //   this.contactID = name || phone || email;
        //   this.img = image;

        //   if (merchantDefault && merchantDefault.length) {
        //     if (merchantDefault[0].image) {
        //       this.img = merchantDefault[0].image;
        //     }
        //   }

        //   this.bio = bio;
        //   this.links = social.map(({name,url:value}) => ({name, value}));
        //   console.log('links: ', this.links);
        if (idUser) {
          const { _id } = _merchantDefault || {};
          const paginate: PaginationInput = {
            findBy: {
              _id: idUser,
            },
          };
          const [contact] = await this._ContactService.contacts(paginate);
          if (contact) {
            const { name, description, link, image } = contact || {};
            this.contactID = name;
            this.img = image;
            this.bio = description;
            for (const { name, value } of link) {
              switch (name) {
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
          } else {
            let { name, phone, email, bio, social, image, ...test } =
              (await this._UsersService.user(idUser)) || {
                social: [],
              };
            const merchantDefault = await this._MerchantService.merchants({
              findBy: {
                owner: idUser,
                default: true,
              },
              options: {
                limit: 1,
              },
            });

            this.contactID = name || phone || email;
            this.img = image;

            if (merchantDefault && merchantDefault.length) {
              if (merchantDefault[0].image) {
                this.img = merchantDefault[0].image;
              }
            }

            this.bio = bio;
            for (const { name, url } of social) {
              switch (name) {
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
    });
  }
}
