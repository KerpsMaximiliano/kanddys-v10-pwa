import { Component, OnInit, Input } from '@angular/core';
import { Item } from 'src/app/core/models/item';

@Component({
  selector: 'app-item-small-card',
  templateUrl: './item-small-card.component.html',
  styleUrls: ['./item-small-card.component.scss']
})
export class ItemSmallCardComponent implements OnInit {
  @Input() item: Item;
  constructor() { }

  ngOnInit(): void {
  }

}
