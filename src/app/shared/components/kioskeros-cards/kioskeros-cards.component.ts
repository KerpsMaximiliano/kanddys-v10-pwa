import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-kioskeros-cards',
  templateUrl: './kioskeros-cards.component.html',
  styleUrls: ['./kioskeros-cards.component.scss'],
})
export class KioskerosCardsComponent implements OnInit {
  @Input() cards = [];

  constructor() {}

  ngOnInit(): void {}
}
