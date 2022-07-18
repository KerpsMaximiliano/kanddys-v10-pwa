import { Component, OnInit } from '@angular/core';

const completeItems = [{
  headline: 'DATE ID PARA (000) 000 - 0000',
  icon: '/whatsapp_verde.svg',
  data: [{
    name: { text: 'AL VENDERSE', fontSize: '13px', color: '#7B7B7B', fontFamily: 'RobotoMedium' },
    subtitle: { text: 'Aquí está el mensaje escrito que agregó el provider para que le llega al comprad..', fontSize: '17px', color: '#202020', fontFamily: 'RobotoItalic' }
  }],
  showSubtitle: false,
}, {
  headline: 'DATE ID PARA (000) 000 - 0000',
  icon: '/whatsapp_verde.svg',
  data: [{
    name: { text: 'AL VENDERSE', fontSize: '13px', color: '#7B7B7B', fontFamily: 'RobotoMedium' },
    subtitle: { text: 'Aquí está el mensaje escrito que agregó el provider para que le llega al comprad..', fontSize: '17px', color: '#202020', fontFamily: 'RobotoItalic' }
  }],
  showSubtitle: false,
}, {
  headline: 'DATE ID PARA (000) 000 - 0000',
  icon: '/whatsapp_verde.svg',
  data: [{
    name: { text: 'AL VENDERSE', fontSize: '13px', color: '#7B7B7B', fontFamily: 'RobotoMedium' },
    subtitle: { text: 'Aquí está el mensaje escrito que agregó el provider para que le llega al comprad..', fontSize: '17px', color: '#202020', fontFamily: 'RobotoItalic' }
  }],
  showSubtitle: false,
}, {
  headline: 'DATE ID PARA (000) 000 - 0000',
  icon: '/whatsapp_verde.svg',
  data: [{
    name: { text: 'AL VENDERSE', fontSize: '13px', color: '#7B7B7B', fontFamily: 'RobotoMedium' },
    subtitle: { text: 'Aquí está el mensaje escrito que agregó el provider para que le llega al comprad..', fontSize: '17px', color: '#202020', fontFamily: 'RobotoItalic' }
  }],
  showSubtitle: false,
}, {
  headline: 'DATE ID PARA (000) 000 - 0000',
  icon: '/whatsapp_verde.svg',
  data: [{
    name: { text: 'AL VENDERSE', fontSize: '13px', color: '#7B7B7B', fontFamily: 'RobotoMedium' },
    subtitle: { text: 'Aquí está el mensaje escrito que agregó el provider para que le llega al comprad..', fontSize: '17px', color: '#202020', fontFamily: 'RobotoItalic' }
  }],
  showSubtitle: false,
},];

@Component({
  selector: 'app-notifications-log',
  templateUrl: './notifications-log.component.html',
  styleUrls: ['./notifications-log.component.scss']
})
export class NotificationsLogComponent implements OnInit {
  completeItems: any[] = completeItems;
  allShow: boolean = false;
  constructor() { }

  ngOnInit(): void {
  }

  showAll = () => {
    this.completeItems.forEach(item => {
      item.showSubtitle = true;
    });
    this.allShow = true;
  }

  return() {
    if (this.allShow) {
      this.completeItems.forEach(item => {
        item.showSubtitle = false;
      });
      this.allShow = false;
    } else {
      console.log('Seria un location Back ')
    }
  }
}
