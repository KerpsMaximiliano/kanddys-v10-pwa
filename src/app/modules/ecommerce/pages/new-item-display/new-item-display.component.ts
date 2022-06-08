import { Component, OnInit } from '@angular/core';
import { Item, ItemPackage } from 'src/app/core/models/item';

@Component({
  selector: 'app-new-item-display',
  templateUrl: './new-item-display.component.html',
  styleUrls: ['./new-item-display.component.scss']
})
export class NewItemDisplayComponent implements OnInit {

    item: Item = {
        name: 'Sample',
        images: ['https://i.imgur.com/SufVLiV.jpeg'],
        description: 'Lorem ipsum dolor sit amet consectetur, adipisicing elit. Temporibus vel aspernatur numquam at, delectus nam ullam facere reprehenderit consectetur neque veniam. Voluptatibus possimus, quia nihil consectetur excepturi eaque laborum aliquid?' ,
        pricing: 500,
        content: ['papitas', 'pizza', 'ensalada cesar']
    }; //ESTA EL ITEM DE SAMPLE
  constructor() { }

  ngOnInit(): void {
  }

}
