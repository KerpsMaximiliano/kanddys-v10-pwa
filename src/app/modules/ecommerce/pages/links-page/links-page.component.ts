import { Component, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { environment } from 'src/environments/environment';
import { ActivatedRoute, Router } from '@angular/router';
import { UsersService } from 'src/app/core/services/users.service';
import { ContactService } from 'src/app/core/services/contact.service';
import { async } from '@angular/core/testing';
import { Contact } from 'src/app/core/models/contact';

@Component({
  selector: 'app-links-page',
  templateUrl: './links-page.component.html',
  styleUrls: ['./links-page.component.scss'],
})
export class LinksPageComponent implements OnInit {
  env: string = environment.assetsUrl;
  userId: string;
  user;
  contacts: Array<Contact>;
  contactIndex: number;

  constructor(
    private route: ActivatedRoute,
    private usersService: UsersService,
    private contactServive: ContactService,
    private router: Router,
    public location: Location,
  ) {}

  card;

  contactCards: object[] = [];

  options = [
    {
      text: 'Compartir',
      callback: async () => {
        console.log('Compartir');
      },
    },
    {
      text: 'Mira como lo verán',
      callback: async () => {
        console.log('Mira como lo verán');
      },
    },
    {
      text: 'Editar',
      callback: async () => {
        console.log('Editar');
        this.router.navigate([`/ecommerce/link-update/${this.userId}/`], {
          queryParams: { index: this.contactIndex },
        });
      },
    },
    {
      text: 'Ocultar',
      callback: async () => {
        console.log('Ocultar');
      },
    },
    {
      text: 'Eliminar (se eliminará toda la data)',
      callback: async () => {
        console.log('Eliminar');
      },
    },
  ];

  // infoCards = [
  //   {
  //     bg: '#fff',
  //     title: 'Recibe el dinero de lo vendido',
  //     subtitle:
  //       'Vende tu producto por WhatsApp y las redes sociales, recibe el pago por transferencia, tarjeta de crédito, paypal',
  //     bottom: true,
  //     bottomTextBold: '87 DoCoins',
  //     img: '../assets/images/noimage.png',
  //   },
  //   {
  //     bg: '#fff',
  //     title: 'Categorías de la vitrina',
  //     subtitle:
  //       'Vende tu producto por WhatsApp y las redes sociales, recibe el pago por transferencia, tarjeta de crédito, paypal',
  //     bottom: true,
  //     bottomTextBold: '3 DoCoins',
  //     img: '../assets/images/noimage.png',
  //   },
  //   {
  //     bg: '#fff',
  //     title: 'Colecciones de Ofertas',
  //     subtitle:
  //       'Con esta funcionalidad, podrás organizar y segmentar tus productos de manera más eficiente…',
  //     bottom: false,
  //     img: '../assets/images/noimage.png',
  //     bottomTextBold: '87 DoCoins',
  //   },
  //   {
  //     bg: '#fff',
  //     title: 'Programa de Recompensas',
  //     subtitle:
  //       'Con esta funcionalidad, podrás organizar y segmentar tus productos de manera más eficiente…',
  //     bottom: false,
  //     img: '../assets/images/noimage.png',
  //     bottomTextBold: '87 DoCoins',
  //   },
  //   {
  //     bg: '#fff',
  //     title: 'Clubes & Comunidades',
  //     subtitle:
  //       'Con esta funcionalidad, podrás organizar y segmentar tus productos de manera más eficiente…',
  //     bottom: false,
  //     img: '../assets/images/noimage.png',
  //     bottomTextBold: '87 DoCoins',
  //   },
  //   {
  //     bg: '#fff',
  //     title: 'Comisiones & Colaboraciones',
  //     subtitle:
  //       'Con esta funcionalidad, podrás organizar y segmentar tus productos de manera más eficiente…',
  //     bottom: false,
  //     img: '../assets/images/noimage.png',
  //     bottomTextBold: '87 DoCoins',
  //   },
  // ];

  async ngOnInit() {
    this.route.params.subscribe(async (params) => {
      this.userId = params.userId;
      console.log(this.userId);
    });

    this.user = await this.usersService.user(this.userId);
    console.log(this.user);

    const pagination = {
      options: { sortBy: 'createdAt:asc', limit: 10, page: 1, range: {} },
      findBy: { user: this.userId },
    };

    const contacts: Array<Contact> = await this.contactServive.contacts(
      pagination
    );

    this.contacts = contacts;

    if (this.contacts.length > 0) {
      for (let i = 0; i < this.contacts[0].link.length; i++) {
        let card = {
          bg: '#fff',
          img: this.contacts[0].link[i].image,
          title: this.contacts[0].link[i].name,
          subtitle: this.contacts[0].link[i].value,
          callback: async () => {
            console.log('Click');
          },
        };
        this.contactCards.push(card);
      }

      this.card = [
        {
          bg: '#fff',
          title: this.user.username ? this.user.username : this.user.email,
          img: this.user.image,
          subtitle: this.user.title,
        },
      ];
    }
  }

  goBack() {
    this.location.back();
  }

  goToLinkRegister() {
    this.router.navigate([`ecommerce/link-register/${this.userId}`]);
  }

  getIndex(index) {
    this.contactIndex = index;
    console.log(index);
  }
}
