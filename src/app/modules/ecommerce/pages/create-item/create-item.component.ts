import { Component, OnInit } from '@angular/core';
import { Item } from 'src/app/core/models/item';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-create-item',
  templateUrl: './create-item.component.html',
  styleUrls: ['./create-item.component.scss']
})
export class CreateItemComponent implements OnInit {
  env = environment.assetsUrl;
  item: Item;

  constructor() { }

  ngOnInit(): void {
  }

  goBack() {
    //
  }

  toggleStatus() {
    //
  }
}
