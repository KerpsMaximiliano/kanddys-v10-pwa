import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { environment } from 'src/environments/environment';

interface Icon {
    src: string;
    alt?: string;
    color?: string; 
    width?: string;
    height?: string;
    margin?: string;
	  callback: () => void;
}
@Component({
  selector: 'app-helper-headerv2',
  templateUrl: './helper-headerv2.component.html',
  styleUrls: ['./helper-headerv2.component.scss']
})
export class HelperHeaderv2Component implements OnInit {
    @Input() bgColor: string = '#4773D8';
    @Input() mode: 'basic' | 'double' | 'options' | 'center' | '2raise' | 'edit' | 'test' ; 
    @Input() public shopCartCallback: () => void;
    @Input() public editBtnCallback: () => void;
    @Input() returnAble: boolean = true;
    @Input() plus: boolean = false;
    @Input() inMall: boolean = false;
    @Input() line: boolean = true;
    @Input() fixed: boolean = false;
    @Input() inMall: boolean;
    @Input() color: string = '#FFFFFF';
    @Input() rmargin: string;
    @Input() filter: string;
    @Input() returnAble: boolean;
    @Input() icons: Icon[];

    @Input() mainText?: {
        text: string,
        fontFamily?: string,
        fontSize?: string,
        color?: string,
        pointer?: boolean
    };
    @Input() leftText?: {
        text: string,
        fontFamily?: string,
        fontSize?: string,
        color?: string,
        pointer?: boolean
    };
    @Input() rightText?: {
        text: string,
        fontFamily?: string,
        fontSize?: string,
        color?: string,
        pointer?: boolean
    };
    @Input() extraTexts?: {
        itemId?: string,
        billId?: string,
        fontFamily?: string,
        fontSize?: string,
        color?: string
    };
    @Input() icon?: {
        src: string,
        alt?: string,
        filter?: string,
        width?: number,
        height?: number,
        callback?: () => void
    };
    @Input() plus?: {
        active: boolean,
        fontFamily?: string,
        fontSize?: string,
        color?: string
    };
    @Input() dots?: {
        active: boolean,
        color?: string,
        func?: () => void
    };
    @Input() edit?:{
        active: boolean,
        batch?: boolean,
        bgColor?: string,
        color?: string
    };
    @Input() shopcart?:{
        active: boolean,
        cartAmount: number,
        filter?: string
    };
    @Input() public editBtnCallback: () => void;
    @Output() returnEvent = new EventEmitter();
    @Output() plusEvent = new EventEmitter();
    @Output() searchEvent = new EventEmitter();
    @Output() dotEvent = new EventEmitter();
    @Output() display = new EventEmitter();
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

  displaying(event){
    this.display.emit(event)
  }

  searchTrigger(event){
    this.searchEvent.emit(event);
  }

  dotAction(event){
    this.dotEvent.emit(event)
  }

  triggerEvent(button: 'plus', value?: any) {
    switch(button) {
      case 'plus': this.plusEvent.emit(); break;
    }
  }

}
