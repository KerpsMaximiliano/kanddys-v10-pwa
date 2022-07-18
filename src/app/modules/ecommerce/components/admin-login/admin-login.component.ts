import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-admin-login',
  templateUrl: './admin-login.component.html',
  styleUrls: ['./admin-login.component.scss']
})
export class AdminLoginComponent implements OnInit {

  constructor() { }

  testItem: Array<any> = [{
    img: 'https://i.imgur.com/pC7xVnn.png', //Imagen del merchant si tiene
    name: {text: 'AQUI VA UN MERCHANT'}, //Nombre
    cta: {
        text: 'Acceder =>',
        color: '#2874AD',
        callback: () => {console.log('Accediste como este merchant')} 
    }
  },{
    img: 'https://i.imgur.com/pC7xVnn.png',
    name: {text: 'AQUI VA UN MERCHANT'}, 
    cta: {
        text: 'Acceder =>',
        color: '#2874AD'
    }
  },{
    img: 'https://i.imgur.com/pC7xVnn.png',
    name: {text: 'AQUI VA UN MERCHANT'},
    cta: {
        text: 'Acceder =>',
        color: '#2874AD'
    }
  }];

  ngOnInit(): void {
  }

}
