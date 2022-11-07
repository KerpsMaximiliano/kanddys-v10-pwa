import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-bubble-button',
  templateUrl: './bubble-button.component.html',
  styleUrls: ['./bubble-button.component.scss'],
})
export class BubbleButtonComponent implements OnInit {
  //Inputs
  @Input() color: 'yellow' | 'blue' | 'black' = 'yellow';
  @Input() bgColor: string;
  @Input() position:
    | 'left'
    | 'right'
    | 'rightxl'
    | 'mini'
    | 'minil'
    | 'minir'
    | 'minis'
    | 'big';
  @Input() cartAmount: number;
  @Input() icon: string;
  @Input() text: string;
  @Input() flexD: string;
  @Input() fontSize: string;
  @Input() lcmargin: string;
  @Input() solo: boolean = true;
  @Input() return: boolean = false;
  @Input() cart: boolean = false;
  @Input() custom: {
    width?: number;
    height?: number;
    left?: string;
    right?: string;
  };
  //valores utilizados
  filterColor: string;
  env: string = environment.assetsUrl;
  constructor() {}

  ngOnInit(): void {
    this.checkColor(this.color);
  }

  checkColor(value: string) {
    switch (value) {
      case 'yellow':
        this.filterColor =
          'invert(39%) sepia(46%) saturate(719%) hue-rotate(163deg) brightness(75%) contrast(97%)';
        break;
      case 'blue':
        this.filterColor =
          'invert(95%) sepia(95%) saturate(2%) hue-rotate(321deg) brightness(9005%) contrast(100%)';
        break;
    }
  }
}