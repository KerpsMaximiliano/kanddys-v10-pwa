import { Component, OnInit } from '@angular/core';
import { CdkDragDrop } from '@angular/cdk/drag-drop';
import { ActivatedRoute } from '@angular/router';
import { ItemsService } from 'src/app/core/services/items.service';

@Component({
  selector: 'app-view-configuration',
  templateUrl: './view-configuration.component.html',
  styleUrls: ['./view-configuration.component.scss']
})
export class ViewConfigurationComponent implements OnInit {
  typeView: String
  title: String
  itemsArray: Array<any> = [];
  optionsArray: Array<any> = [];

  constructor(private activatedRoute: ActivatedRoute, private itemsService: ItemsService) { }

  async ngOnInit() {
    let path = this.activatedRoute.snapshot.routeConfig.path;
    if(path == "view-configuration-items"){
      this.typeView = "items"
      this.title = "Orden de artículos"
    }
    if(path == "view-configuration-cards"){
      this.typeView = "cards"
      this.title = "Carta de artículos"
    }
    await this.addItem(this.itemsArray,"63d429d7849f894c1895c659")
    await this.addItem(this.itemsArray,"63d420a8849f894c189544d4")
    await this.addItem(this.itemsArray,"63c93768a6ce9322ca278888")
    await this.addItem(this.itemsArray,"63c61f50a6ce9322ca216714")
    await this.addItem(this.optionsArray,"63d429d7849f894c1895c659")
    await this.addItem(this.optionsArray,"63d420a8849f894c189544d4")
  }

  async dropTagDraggable(event: CdkDragDrop<{ gridItem: any; index: number }>) {
    this.itemsArray[event.previousContainer.data.index] =
      event.container.data.gridItem;
    this.itemsArray[event.container.data.index] =
      event.previousContainer.data.gridItem;
  }

  async addItem(array: any, id: string){
    let item = await this.itemsService.item(id);
    array.push(item);
  }

}
