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
  address: string;
  whatsapp: string;
  telegram: string;
  _phone: string;
  idUser: string;
  image: string;
  links: any[];
  contactDirection: string;
  location: string;
  contactIndex;
  contactCards: object[] = [];

  constructor(
    private _UsersService: UsersService,
    private _ActivatedRoute: ActivatedRoute,
    private _MerchantService: MerchantsService,
    private _ContactService: ContactService
  ) {}

  ngOnInit(): void {
    console.log("VERGACIÓNNNNNNNNNNNNN AAAAAAAAAAAAAAAAAAAAAAAAAAA");
    this._ActivatedRoute.params.subscribe(({ idUser }) => {
      (async () => {
        this.idUser = idUser;
        let _merchantDefault = await this._MerchantService.merchantDefault();

        console.log(_merchantDefault);
        if (_merchantDefault && _merchantDefault.address)
          this.address = _merchantDefault.address;

        const { image } = _merchantDefault || {};
        this.image = image;
        const { _id } = _merchantDefault || {};
        const paginate: PaginationInput = {
          findBy: {
            user: idUser,
          },
          options: {
            sortBy: 'updatedAt:desc',
            limit: 10,
          },
        };
        // const [contact] = await this._ContactService.contacts(paginate);
        // if (contact) {
        //   const { _id, name, description, link, image } = contact || {};
        //   this.contactID = name;
        //   this.img = image;
        //   this.bio = description;

        //   this.links = link.filter(({ name, value }) => name !== 'location');
        //   this.idUser = _id;
        //   const direction = link.find(({ name, value }) => name === 'location');

        //   console.log(this.links);

        //   this.contactDirection = this.address || '';
        //   this.location = direction?.value || '';
        // }

        const contacts = await this._ContactService.contacts(paginate);
        let { name, phone, email, bio, social, image: userImage, ...test }: any =
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
          this.img = userImage;

          if (merchantDefault && merchantDefault.length) {
            if (merchantDefault[0].image) {
              this.img = merchantDefault[0].image;
            }

            if (merchantDefault[0].address) {
              this.contactDirection = merchantDefault[0].address;
            }
          }

          this.bio = bio;
          
        if (contacts.length) {
          console.log(contacts);

          this.links = contacts;

          for (let i = 0; i < this.links.length; i++) {
            let card = {
              bg: '#fff',
              img: this.links[i]?.image ? this.links[i]?.image : './assets/images/noimage.png',
              title: this.links[i]?.description,
              // subtitle: this.links[i]?.description,
              callback: async () => {
                console.log('Click');
              },
            };
            this.contactCards.push(card);
          }
          console.log(this.contactCards);
          this.links = social.map(({ name, url: value }) => ({ name, value }));
        }
      })();
    });
  }
}
