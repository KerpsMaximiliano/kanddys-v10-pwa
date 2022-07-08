import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { environment } from 'src/environments/environment';

interface ListedItem {
    img?: string;
    name: string;
    subtitle?: string;
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
        icon?: {
            src: string;
            alt?: string;
            color?: string;
            width?: number;
            height?: number;
        };
        text: string;
        color?: string;
        fontFamily?: string;
        fontSize?: string;
    };
    @Input() icon: {
        src: string;
        alt?: string;
        color?: string;
        width?: number;
        height?: number;
        callback?: () => void;
    };
    @Input() itemList: ListedItem[];
    @Input() bottomText: {
        leftText?:{
            text: string;
            color?: string;
            fontFamily?: string;
            fontSize?: string;
            callback?: () => void;
            arrow?: boolean;
        };
        rightText?: {
            text: string;
            color?: string;
            fontFamily?: string;
            fontSize?: string;
            callback?: () => void;
        }
    };
    showEntry: boolean;
    env: string = environment.assetsUrl;

  constructor() { }

  ngOnInit(): void {
  }


  showHide(event){
    this.showEntry = !this.showEntry;
  }
}
