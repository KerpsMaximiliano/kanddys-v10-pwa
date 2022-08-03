import { Component, OnInit } from '@angular/core';
import { Item } from 'src/app/core/models/item';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-create-item',
  templateUrl: './create-item.component.html',
  styleUrls: ['./create-item.component.scss'],
})
export class CreateItemComponent implements OnInit {
  env = environment.assetsUrl;
  defaultImages: (string | ArrayBuffer)[] = [''];
  imagesAlreadyLoaded: boolean;
  item: Item;
  mode: 'main' | 'name' = 'main';
  disableFooter = true;

  constructor() {}

  ngOnInit(): void {}

  goBack() {
    if (this.mode === 'name') return (this.mode = 'main');
  }

  toggleStatus() {
    //
  }
}
