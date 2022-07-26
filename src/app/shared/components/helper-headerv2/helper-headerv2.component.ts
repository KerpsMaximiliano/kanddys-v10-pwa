import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { error } from 'console';
import { environment } from 'src/environments/environment';

interface Text {
  text: string,
  fontFamily?: string,
  fontSize?: string,
  color?: string,
  pointer?: boolean
}

interface ExtraText {
  itemId?: string,
  billId?: string,
  fontFamily?: string,
  fontSize?: string,
  color?: string
}

interface Icon {
    src: string;
    alt?: string;
    color?: string; 
    width?: string;
    height?: string;
    margin?: string;
    highlight?: {
        active?: boolean;
        highlighted?: boolean;
        color?: string;
        filter?: string;
    };
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
    @Input() down: boolean;
    @Input() inMall: boolean = false;
    @Input() line: boolean = true;
    @Input() fixed: boolean = false;
    @Input() color: string = '#FFFFFF';
    @Input() rmargin: string;
    @Input() flexDirection: string;
    @Input() justifyContent: string;
    @Input() alignItems: string;
    @Input() filter: string;
    @Input() icons: Icon[];
    @Input() mainText?: Text;
    @Input() leftText?: Text;
    @Input() leftTextStyles: Record<string, any>;
    @Input() editStyles: Record<string, any>;
    @Input() rightText?: Text;
    @Input() public rightTextCallback: () => void;
    @Input() rightTextStyles: Record<string, any>;
    @Input() extraTexts?: ExtraText;
    @Input() icon?: {
        src: string,
        alt?: string,
        cursor?: string,
        filter?: string,
        width?: number,
        height?: number,
        margin?: string;
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
        color?: string,
        text?: string
    };
    @Input() shopcart?:{
        active: boolean,
        cartAmount: number,
        filter?: string
    };
    @Output() returnEvent = new EventEmitter();
    @Output() plusEvent = new EventEmitter();
    @Output() agnosticAction = new EventEmitter();
    @Output() dotEvent = new EventEmitter();
    @Output() display = new EventEmitter();
    env: string = environment.assetsUrl;

  constructor() {}

  ngOnInit(): void {
  }

  neutralEvent(){
    this.agnosticAction.emit();
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

  dotAction(event){
    this.dotEvent.emit(event)
  }

  triggerEvent(button: 'plus', value?: any) {
    switch(button) {
      case 'plus': this.plusEvent.emit(); break;
    }
  }

  highlight(i){
    if (this.icons && this.icons[i].highlight.active === true) {
    this.icons[i].highlight.highlighted = !this.icons[i].highlight.highlighted;
    } else {
      console.log('');
    }
  }
}
