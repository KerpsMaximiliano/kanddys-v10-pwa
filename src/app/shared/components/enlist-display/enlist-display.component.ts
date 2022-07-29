import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { environment } from 'src/environments/environment';

interface Text {
    text: string;
    color?: string;
    fontFamily?: string;
    fontSize?: string;
    pointer?: boolean;
    callback?: () => void;
}

interface Icon{
    src: string;
    alt?: string;
    color?: string;
    width?: number;
    height?: number;
    callback?: () => void;
}

export interface ListedItem {
    img?: string;
    name: Text;
    subtitle?: Text;
    cta?: {
        text: string;
        color?: string;
        callback: () => void; 
    }
}

@Component({
  selector: 'app-enlist-display',
  templateUrl: './enlist-display.component.html',
  styleUrls: ['./enlist-display.component.scss']
})
export class EnlistDisplayComponent implements OnInit {

    @Input() headline: {
        icon?: Icon;
        text: Text;
    };
    @Input() icon?: Icon;
    @Input() iconText:{
        texts?: Text[];
        icons?: Icon[];
    }
    @Input() bottomText: {
        leftText?:{
            text: Text;
            arrow?: boolean;
        };
        extraText?: Text;
        rightText?: Text;
    };
    @Input() itemList: ListedItem[];
    @Input() plus: boolean;
    @Input() marginBottom: string;
    @Input() tMarginTop: string;
    @Input() textArray: Text[];
    showEntry: boolean;
    @Input() showSubtitle: boolean;
    env: string = environment.assetsUrl;

  constructor() { }

  ngOnInit(): void {
  }


  showHide(event){
    this.showEntry = !this.showEntry;
  }
}
