import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Item } from 'src/app/core/models/item';

@Component({
  selector: 'app-item',
  templateUrl: './item.component.html',
  styleUrls: ['./item.component.scss'],
})
export class ItemComponent implements OnInit {
  @Input() item: Item;
  price: number;
  @Output() imageEvent = new EventEmitter();

  constructor() {}

  ngOnInit(): void {
    if (this.item.params?.length) {
      let lowest = 0;
      this.item.params.forEach((params) => {
        params.values.forEach((values) => {
          if (lowest === 0) lowest = values.price;
          if (values.price < lowest) lowest = values.price;
        });
      });
      this.price = this.item.pricing + lowest;
    }
  }
}
