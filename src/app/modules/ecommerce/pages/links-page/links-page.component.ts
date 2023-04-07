import { Component, OnInit } from '@angular/core';
import { environment } from 'src/environments/environment';
import { ActivatedRoute, Router } from '@angular/router';
import { UsersService } from 'src/app/core/services/users.service';
import { ContactService } from 'src/app/core/services/contact.service';

@Component({
  selector: 'app-links-page',
  templateUrl: './links-page.component.html',
  styleUrls: ['./links-page.component.scss'],
})
export class LinksPageComponent implements OnInit {
  env: string = environment.assetsUrl;
  userId: string;
  user;
  contacts;

  constructor(
    private route: ActivatedRoute,
    private usersService: UsersService,
    private contactServive: ContactService,
    private router: Router
  ) {}

  card;

  contactCards: object[] = [];

  infoCards = [
    {
      bg: '#fff',
      title: 'Recibe el dinero de lo vendido',
      subtitle:
        'Vende tu producto por WhatsApp y las redes sociales, recibe el pago por transferencia, tarjeta de crédito, paypal',
      bottom: true,
      bottomTextBold: '87 DoCoins',
      img: '../assets/images/noimage.png',
    },
    {
      bg: '#fff',
      title: 'Categorías de la vitrina',
      subtitle:
        'Vende tu producto por WhatsApp y las redes sociales, recibe el pago por transferencia, tarjeta de crédito, paypal',
      bottom: true,
      bottomTextBold: '3 DoCoins',
      img: '../assets/images/noimage.png',
    },
    {
      bg: '#fff',
      title: 'Colecciones de Ofertas',
      subtitle:
        'Con esta funcionalidad, podrás organizar y segmentar tus productos de manera más eficiente…',
      bottom: false,
      img: '../assets/images/noimage.png',
      bottomTextBold: '87 DoCoins',
    },
    {
      bg: '#fff',
      title: 'Programa de Recompensas',
      subtitle:
        'Con esta funcionalidad, podrás organizar y segmentar tus productos de manera más eficiente…',
      bottom: false,
      img: '../assets/images/noimage.png',
      bottomTextBold: '87 DoCoins',
    },
    {
      bg: '#fff',
      title: 'Clubes & Comunidades',
      subtitle:
        'Con esta funcionalidad, podrás organizar y segmentar tus productos de manera más eficiente…',
      bottom: false,
      img: '../assets/images/noimage.png',
      bottomTextBold: '87 DoCoins',
    },
    {
      bg: '#fff',
      title: 'Comisiones & Colaboraciones',
      subtitle:
        'Con esta funcionalidad, podrás organizar y segmentar tus productos de manera más eficiente…',
      bottom: false,
      img: '../assets/images/noimage.png',
      bottomTextBold: '87 DoCoins',
    },
  ];

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

    const contacts = await this.contactServive.contacts(pagination);

    console.log(contacts);

    this.contacts = contacts;

    for (let i = 0; i < this.contacts.length; i++) {
      let card = {
        bg: '#fff',
        img: this.contacts[i]?.image,
        title: this.contacts[i]?.name,
        subtitle: this.contacts[i]?.description,
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

  goToLinkRegister() {
    this.router.navigate([`ecommerce/link-register/${this.userId}`]);
  }
}
