import { Component, OnInit } from '@angular/core';

const simpleItems = [{
  headline: 'DATE ID PARA (000) 000 - 0000',
  icon: '/whatsapp_verde.svg',
  data: [{name: { text: 'AL VENDERSE', fontSize: '13px', color: '#7B7B7B', fontFamily: 'RobotoMedium'}}]
},{
  headline: 'DATE ID PARA (000) 000 - 0000',
  icon: '/whatsapp_verde.svg',
  data: [{name: { text: 'AL VENDERSE', fontSize: '13px', color: '#7B7B7B', fontFamily: 'RobotoMedium'}}]
},{
  headline: 'DATE ID PARA (000) 000 - 0000',
  icon: '/whatsapp_verde.svg',
  data: [{name: { text: 'AL VENDERSE', fontSize: '13px', color: '#7B7B7B', fontFamily: 'RobotoMedium'}}]
},{
  headline: 'DATE ID PARA (000) 000 - 0000',
  icon: '/whatsapp_verde.svg',
  data: [{name: { text: 'AL VENDERSE', fontSize: '13px', color: '#7B7B7B', fontFamily: 'RobotoMedium'}}]
},{
  headline: 'DATE ID PARA (000) 000 - 0000',
  icon: '/whatsapp_verde.svg',
  data: [{name: { text: 'AL VENDERSE', fontSize: '13px', color: '#7B7B7B', fontFamily: 'RobotoMedium'}}]
},{
  headline: 'DATE ID PARA (000) 000 - 0000',
  icon: '/whatsapp_verde.svg',
  data: [{name: { text: 'AL VENDERSE', fontSize: '13px', color: '#7B7B7B', fontFamily: 'RobotoMedium'}}]
},{
  headline: 'DATE ID PARA (000) 000 - 0000',
  icon: '/whatsapp_verde.svg',
  data: [{name: { text: 'AL VENDERSE', fontSize: '13px', color: '#7B7B7B', fontFamily: 'RobotoMedium'}}]
},{
  headline: 'DATE ID PARA (000) 000 - 0000',
  icon: '/whatsapp_verde.svg',
  data: [{name: { text: 'AL VENDERSE', fontSize: '13px', color: '#7B7B7B', fontFamily: 'RobotoMedium'}}]
}];

const completeItems = [{
  headline: 'DATE ID PARA (000) 000 - 0000',
  icon: '/whatsapp_verde.svg',
  data: [{name: { text: 'AL VENDERSE', fontSize: '13px', color: '#7B7B7B', fontFamily: 'RobotoMedium'},
          subtitle: {text: 'Aquí está el mensaje escrito que agregó el provider para que le llega al comprad..', fontSize: '17px', color: '#202020', fontFamily: 'RobotoItalic'}}]
  },{
  headline: 'DATE ID PARA (000) 000 - 0000',
  icon: '/whatsapp_verde.svg',
  data: [{name: { text: 'AL VENDERSE', fontSize: '13px', color: '#7B7B7B', fontFamily: 'RobotoMedium'},
          subtitle: {text: 'Aquí está el mensaje escrito que agregó el provider para que le llega al comprad..', fontSize: '17px', color: '#202020', fontFamily: 'RobotoItalic'}}]
  },{
  headline: 'DATE ID PARA (000) 000 - 0000',
  icon: '/whatsapp_verde.svg',
  data: [{name: { text: 'AL VENDERSE', fontSize: '13px', color: '#7B7B7B', fontFamily: 'RobotoMedium'},
          subtitle: {text: 'Aquí está el mensaje escrito que agregó el provider para que le llega al comprad..', fontSize: '17px', color: '#202020', fontFamily: 'RobotoItalic'}}]
  },{
  headline: 'DATE ID PARA (000) 000 - 0000',
  icon: '/whatsapp_verde.svg',
  data: [{name: { text: 'AL VENDERSE', fontSize: '13px', color: '#7B7B7B', fontFamily: 'RobotoMedium'},
          subtitle: {text: 'Aquí está el mensaje escrito que agregó el provider para que le llega al comprad..', fontSize: '17px', color: '#202020', fontFamily: 'RobotoItalic'}}]
  },{
  headline: 'DATE ID PARA (000) 000 - 0000',
  icon: '/whatsapp_verde.svg',
  data: [{name: { text: 'AL VENDERSE', fontSize: '13px', color: '#7B7B7B', fontFamily: 'RobotoMedium'},
          subtitle: {text: 'Aquí está el mensaje escrito que agregó el provider para que le llega al comprad..', fontSize: '17px', color: '#202020', fontFamily: 'RobotoItalic'}}]
  },];

@Component({
  selector: 'app-notifications-log',
  templateUrl: './notifications-log.component.html',
  styleUrls: ['./notifications-log.component.scss']
})
export class NotificationsLogComponent implements OnInit {

  simpleItems: Array<any> = simpleItems;

  completeItems: any[] = completeItems;
  allShow: boolean = false;
  constructor() { }

  ngOnInit(): void {
  }

  showAll = ()=>{
    this.allShow = !this.allShow;
  }

  return(){
    if(this.allShow){
        this.allShow = !this.allShow;
    }else {
        console.log('Seria un location Back ')
    }
  }
}
