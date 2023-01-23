import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-buyer-card',
  templateUrl: './buyer-card.component.html',
  styleUrls: ['./buyer-card.component.scss'],
})
export class BuyerCardComponent implements OnInit {
  @Input() background: string = '#E9E371';
  @Input() headline: string =
    'kebdleinceib ek nedbejb ek eifb ekdedkenidne dke oleoe ek eifknei edk';
  @Input() leftText: string = 'Texto Izquierda';
  @Input() rightText: string = 'Texto Derecha';

  constructor() {}

  ngOnInit(): void {}
}
