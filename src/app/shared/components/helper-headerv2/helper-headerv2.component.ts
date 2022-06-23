import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { environment } from 'src/environments/environment';

interface config  {
    text?: string,
    fontFamily?: string,
    leftText?: string,
    leftFont?: string,
    rightText?: string,
    rightFont?: string,
    fontSize?: string,
    plusFont?: string,
    plusSize?: string,
    plusColor?: string,
    billId?: string,
    itemId?: string,
    icon?: string,
    return?: boolean,
    shopcart?: boolean,
    whatsapp?: boolean,
    fixed?: boolean,
    edit?: boolean,
    batch?: boolean,
    dots?: boolean,
    search?: boolean,
    plus?: boolean,
    upload?: boolean,
    inMall?: boolean,
    pointer?: boolean,
}

@Component({
  selector: 'app-helper-headerv2',
  templateUrl: './helper-headerv2.component.html',
  styleUrls: ['./helper-headerv2.component.scss']
})
export class HelperHeaderv2Component implements OnInit {
    @Input() bgColor: string = '#4773D8';
    @Input() mode: 'basic' | 'double' | 'options' | 'center' | '2raise' | 'edit' | 'test' ; 
    @Input() cartAmount: number;
    @Input() public shopCartCallback: () => void;
    @Input() line: boolean = true;
    @Input() fixed: boolean = false;
    @Input() color: string = '#FFFFFF';
    @Input() rmargin: string;
    @Input() filter: string;
    @Input() config?: config;
    @Output() returnEvent = new EventEmitter();
    @Output() plusEvent = new EventEmitter();
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

  triggerEvent(button: 'plus', value?: any) {
    switch(button) {
      case 'plus': this.plusEvent.emit(); break;
    }
  }

}
