import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-bubble-button',
  templateUrl: './bubble-button.component.html',
  styleUrls: ['./bubble-button.component.scss']
})
export class BubbleButtonComponent implements OnInit {

  //Inputs
  @Input() color: 'yellow' | 'blue' = 'yellow';
  @Input() position: 'left'| 'right' | 'rightxl' | 'mini' | 'minir' | 'minis' | 'big';
  @Input() cartAmount: number;
  @Input() icon: string;
  @Input() text: string;
  @Input() flexD: string;
  @Input() fontSize: string;
  @Input() solo: boolean = true;
  @Input() return: boolean = false;
  @Input() cart: boolean = false;

  //EventEmitters
  @Output() leftAction: EventEmitter<any> = new EventEmitter();

  //valores utilizados
  palette: string;
  fontColor: string;
  filterColor: string;
  env: string = environment.assetsUrl;
  constructor() { }

  ngOnInit(): void {
    this.checkColor(this.color);
  }

  checkColor(value: string) {
    switch (value) {
      case 'yellow':
        this.palette = '#E9E371';
        this.fontColor = '#2874AD';
        this.filterColor = 'invert(39%) sepia(46%) saturate(719%) hue-rotate(163deg) brightness(75%) contrast(97%)';

        break;

      case 'blue':
        this.palette = '#2874AD';
        this.fontColor = '#FFFFFF';
        this.filterColor = 'invert(95%) sepia(95%) saturate(2%) hue-rotate(321deg) brightness(9005%) contrast(100%)';
        break;
    }
  }

  leftButton() {
    this.leftAction.emit();
    console.log('boton izquierdo');
  }

}
