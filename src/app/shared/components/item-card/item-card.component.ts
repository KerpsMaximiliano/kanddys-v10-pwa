import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-item-card',
  templateUrl: './item-card.component.html',
  styleUrls: ['./item-card.component.scss']
})
export class ItemCardComponent implements OnInit {
    imageFolder: string;
    @Input() quantity: string = '00';
    @Input() centerImage: string;
    @Input() itemPrice: string = '0.00';
    @Input() itemIncome: string = '000,000.00'
  constructor() {
    this.imageFolder = environment.assetsUrl;
   }

  ngOnInit(): void {
  }

}
