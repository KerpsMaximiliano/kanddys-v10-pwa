import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-buyer-card',
  templateUrl: './buyer-card.component.html',
  styleUrls: ['./buyer-card.component.scss'],
})
export class BuyerCardComponent implements OnInit {
  @Input() shadow: boolean = true;
  @Input() img: string = '';
  @Input() title: string
  @Input() description: string
  @Input() leftAmount: number
  @Input() rightAmount: number 

  constructor() {}

  ngOnInit(): void {}
}
