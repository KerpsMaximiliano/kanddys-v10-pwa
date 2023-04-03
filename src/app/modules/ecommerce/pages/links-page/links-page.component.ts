import { Component, OnInit } from '@angular/core';
import { environment } from 'src/environments/environment';
import { ActivatedRoute, Router } from '@angular/router';
import { UsersService } from 'src/app/core/services/users.service';

@Component({
  selector: 'app-links-page',
  templateUrl: './links-page.component.html',
  styleUrls: ['./links-page.component.scss'],
})
export class LinksPageComponent implements OnInit {
  env: string = environment.assetsUrl;
  userId: string;
  user;

  constructor(
    private route: ActivatedRoute,
    private usersService: UsersService
  ) {}

  card;

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
