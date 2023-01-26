import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-buyer-card',
  templateUrl: './buyer-card.component.html',
  styleUrls: ['./buyer-card.component.scss'],
})
export class BuyerCardComponent implements OnInit {
  @Input() img: string = '/assets/images/noimage.png';
  @Input() headline: string =
    'kebdleinceib ek nedbejb ek eifb ekdedkenidne dke oleoe ek eifknei edkeib ek nedbejb ek eifb ekdedkenidne dke oleoe ek eifknei edk';
  @Input() leftText: string = 'Texto Izquierda';
  @Input() rightText: string = 'Texto Derecha';

  constructor() {}

  ngOnInit(): void {}
}
