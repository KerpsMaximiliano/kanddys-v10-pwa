import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-helper-headerv2',
  templateUrl: './helper-headerv2.component.html',
  styleUrls: ['./helper-headerv2.component.scss']
})
export class HelperHeaderv2Component implements OnInit {
    imageFolder: string;
    @Input() bgColor: string = '#4773D8';
    @Input() navtext: string = 'Volver';
    @Input() mode: string = 'basic' || 'double' || 'options' || 'center'; 
    @Input() whatsapp: boolean = true;
    @Input() shopcart: boolean = true;
    @Input() returnAble: boolean = true;
    @Input() plus: boolean = false;
    @Input() upload: boolean = false;
    @Input() line: boolean = true;
    @Input() leftText: string = 'Ir A Mis Datos Personales';
    @Input() rightText: string = 'Ir A Los Datos Mi Tienda';
    @Output() returnEvent = new EventEmitter()

  constructor() {
      this.imageFolder = environment.assetsUrl;
   }

  ngOnInit(): void {
  }

  return(event){
    this.returnEvent.emit(event)
  }
}
