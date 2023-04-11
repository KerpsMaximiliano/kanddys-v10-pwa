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
  _phone: string;
  idUser: string;
  image: string;
  links: any[];
  contactDirection: string;
  location: string;

  constructor(
    private usersService: UsersService,
    private route: ActivatedRoute,
    private merchantService: MerchantsService,
    private contactService: ContactService
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(({ idUser }) => {
      (async () => {
        this.idUser = idUser;
        const _merchantDefault = await this.merchantService.merchantDefault();
        const { address, image } = _merchantDefault || {};

        if (_merchantDefault && address)
          this.address = address;

        this.image = image;

        const paginate: PaginationInput = {
          findBy: {
            user: idUser,
          },
          options: {
            sortBy: 'updatedAt:desc',
            limit: -1,
          },
        };
        const [contact] = await this.contactService.contacts(paginate);

        if (contact) {
          const { _id, name, description, link, image } = contact || {};
          this.contactID = name;
          this.img = image;
          this.bio = description;
          this.links = link.filter(({ name, value }) => name !== 'location');
          this.idUser = _id;
          const direction = link.find(({ name, value }) => name === 'location');

          this.contactDirection = this.address || '';
          this.location = direction?.value || '';
        } else {
          let { name, phone, email, bio, social, image, ...test }: any =
            (await this.usersService.user(idUser)) || {
              social: [],
            };

          const merchantDefault = await this.merchantService.merchants({
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

            if (merchantDefault[0].address) {
              this.contactDirection = merchantDefault[0].address;
            }
          }

          this.bio = bio;
          this.links = social.map(({ name, url: value }) => ({ name, value }));
        }
      })();
    });
  }
}
