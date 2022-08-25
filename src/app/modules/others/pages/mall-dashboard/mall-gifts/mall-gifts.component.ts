import { Component, OnInit } from '@angular/core';
import { Item, ItemCategory } from 'src/app/core/models/item';

@Component({
  selector: 'app-mall-gifts',
  templateUrl: './mall-gifts.component.html',
  styleUrls: ['./mall-gifts.component.scss']
})
export class MallGiftsComponent implements OnInit {
  categories: ItemCategory[] = [];
  items: Item[] = [];

  constructor() { }

  ngOnInit(): void {
  }

}
