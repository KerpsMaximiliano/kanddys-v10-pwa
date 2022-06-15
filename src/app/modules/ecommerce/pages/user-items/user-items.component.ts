import { Component, OnInit } from '@angular/core';
import { Item } from 'src/app/core/models/item';
import { ItemsService } from 'src/app/core/services/items.service';

@Component({
  selector: 'app-user-items',
  templateUrl: './user-items.component.html',
  styleUrls: ['./user-items.component.scss']
})
export class UserItemsComponent implements OnInit {
  items: Item[] = [];

  constructor(
    private itemsService: ItemsService,
  ) { }

  async ngOnInit(): Promise<void> {
    const item = await this.itemsService.item("628d47985d291213549ccb50");
    this.items = [item, item, item, item, item, item, item]
  }

}
