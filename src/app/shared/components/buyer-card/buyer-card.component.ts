import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-buyer-card',
  templateUrl: './buyer-card.component.html',
  styleUrls: ['./buyer-card.component.scss'],
})
export class BuyerCardComponent implements OnInit {
  @Input() ID: string = '';
  @Input() index: number;
  @Input() shadow: boolean = true;
  @Input() img: string = '';
  @Input() title: string;
  @Input() description: string;
  @Input() leftAmount: number;
  @Input() rightAmount: number;
  @Input() cta: boolean;
  @Input() ctaActive: boolean = false;
  @Output() ctaClicked = new EventEmitter();

  env: string = environment.assetsUrl;

  constructor() {}

  ngOnInit(): void {}

  emitClick() {
    this.ctaActive = !this.ctaActive;
    this.ctaClicked.emit(this.index);
  }
}
