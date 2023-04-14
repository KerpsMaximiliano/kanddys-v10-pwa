import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-facturas-display2',
  templateUrl: './facturas-display2.component.html',
  styleUrls: ['./facturas-display2.component.scss'],
})
export class FacturasDisplay2Component implements OnInit {
  @Input() cardsArray = [];
  @Input() cardsArray2 = [];
  @Input() barColor: string = '#82f18d';
  @Input('displayImage') displayImage: boolean = false;

  constructor() {}

  ngOnInit(): void {}
}
