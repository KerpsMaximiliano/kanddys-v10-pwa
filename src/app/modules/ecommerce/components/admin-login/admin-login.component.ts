import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/core/services/auth.service';

@Component({
  selector: 'app-admin-login',
  templateUrl: './admin-login.component.html',
  styleUrls: ['./admin-login.component.scss']
})
export class AdminLoginComponent implements OnInit {

  constructor(
    private authService: AuthService,
  ) { }

  testItem: Array<any> = [{
    img: 'https://i.imgur.com/pC7xVnn.png', //Imagen del merchant si tiene
    name: { text: 'Foto Davitte' }, //Nombre
    cta: {
      text: 'Acceder =>',
      color: '#2874AD',
      callback: () => this.adminLogin('19188156444')
    }
  }, {
    img: 'https://i.imgur.com/pC7xVnn.png',
    name: { text: 'Caffaro' },
    cta: {
      text: 'Acceder =>',
      color: '#2874AD',
      callback: () => this.adminLogin('18492203488')
    }
  }, {
    img: 'https://i.imgur.com/pC7xVnn.png',
    name: { text: 'Cecilia' },
    cta: {
      text: 'Acceder =>',
      color: '#2874AD',
      callback: () => this.adminLogin('18095636780')
    }
  }];

  ngOnInit(): void {
  }

  async adminLogin(phoneNumber: string) {
    const result = await this.authService.generatePowerMagicLink(phoneNumber);
    console.log(result);
  }

}
