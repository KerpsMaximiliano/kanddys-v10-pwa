import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-helper-headerv2',
  templateUrl: './helper-headerv2.component.html',
  styleUrls: ['./helper-headerv2.component.scss']
})
export class HelperHeaderv2Component implements OnInit {
    @Input() bgColor: string = '#4773D8';
    @Input() navtext: string = 'Volver';
    @Input() mode: 'basic' | 'double' | 'options' | 'center' | '2raise' | 'edit' ; 
    @Input() whatsapp: boolean = true;
    @Input() shopcart: boolean = true;
    @Input() cartAmount: number;
    @Input() public shopCartCallback: () => void;
    @Input() returnAble: boolean = true;
    @Input() plus: boolean = false;
    @Input() upload: boolean = false;
    @Input() inMall: boolean = false;
    @Input() line: boolean = true;
    @Input() leftText: string = 'Ir A Mis Datos Personales';
    @Input() rightText: string = 'Ir A Los Datos Mi Tienda';
    @Input() billId: string;
    @Input() itemId: string;
    @Input() fixed: boolean = false;
    @Input() edit: boolean = false;
    @Input() batch: boolean = false;
    @Input() search: boolean = false;
    @Input() dots: boolean = false;
    @Input() color: string = '#FFFFFF';
    @Input() icon: string;
    @Input() fontFamily: string = 'SfProBold';
    @Input() fontSize: string = '35px';
    @Input() rmargin: string;
    @Input() filter: string = 'invert(87%) sepia(89%) saturate(339%) hue-rotate(350deg) brightness(176%) contrast(90%)';
    @Output() returnEvent = new EventEmitter();
    @Output() searchEvent = new EventEmitter();
    @Output() dotEvent = new EventEmitter();
    env: string = environment.assetsUrl;

  constructor() {}

  ngOnInit(): void {
  }

  shopCartTrigger() {
    this.shopCartCallback();
  }

  return(event){
    this.returnEvent.emit(event)
  }

  searchTrigger(event){
    this.searchEvent.emit(event);
  }

  dotAction(event){
    this.dotEvent.emit(event)
  }

}
