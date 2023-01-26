import { Component, OnInit } from '@angular/core';
import { timeStamp } from 'console';
import { Tag } from 'src/app/core/models/tags';
import { ItemsService } from 'src/app/core/services/items.service';
import { environment } from 'src/environments/environment';
import { Button } from '../general-item/general-item.component';

@Component({
  selector: 'app-tag-items',
  templateUrl: './tag-items.component.html',
  styleUrls: ['./tag-items.component.scss']
})
export class TagItemsComponent implements OnInit {

  environment: string = environment.assetsUrl;
  optional = true;

  items: Array<any> = []
  optionsButton: Array <Button> = []

  constructor(private itemsService: ItemsService) { }

 async ngOnInit(){
   let item = await this.itemsService.item('63c61f50a6ce9322ca216714').then(item=>{
    for (let index = 0; index < 6; index++) {
      this.items.push(item)
      this.optionsButton.push({
        clickEvent: (params: Tag) => {
          alert("clicked")
        },
      })
    }
   });
  }

}
