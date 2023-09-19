import { Component, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { CdkDragDrop } from '@angular/cdk/drag-drop';
import { ActivatedRoute } from '@angular/router';
import { ItemsService } from 'src/app/core/services/items.service';
// import { MerchantsService } from 'src/app/core/services/merchants.service';
import { SaleFlowService } from 'src/app/core/services/saleflow.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-view-configuration',
  templateUrl: './view-configuration.component.html',
  styleUrls: ['./view-configuration.component.scss'],
})
export class ViewConfigurationComponent implements OnInit {
  typeView: String;
  title: String;
  itemsArray: Array<any> = [];
  optionsArray: Array<any> = [];
  isSimpleCard: boolean;

  isDescription: boolean = false;
  isSimple: boolean = false;
  isFull: boolean = false;
  newView;

  constructor(
    // public merchantsService: MerchantsService,
    public saleflowService: SaleFlowService,
    private activatedRoute: ActivatedRoute, // private itemsService: ItemsService
    public router: Router,
    public location: Location,
  ) {}

  async ngOnInit() {
    let path = this.activatedRoute.snapshot.routeConfig.path;
    if (path == 'view-configuration-items') {
      this.typeView = 'items';
      this.title = 'Orden de artículos';
    }
    if (path == 'view-configuration-cards') {
      this.typeView = 'cards';
      this.title = 'Carta de artículos';
    }

    // await this.addItem(this.itemsArray, '63d429d7849f894c1895c659');
    // await this.addItem(this.itemsArray, '63d420a8849f894c189544d4');
    // await this.addItem(this.itemsArray, '63c93768a6ce9322ca278888');
    // await this.addItem(this.itemsArray, '63c61f50a6ce9322ca216714');
    // await this.addItem(this.optionsArray, '63d429d7849f894c1895c659');
    // await this.addItem(this.optionsArray, '63d420a8849f894c189544d4');
  }

  async dropTagDraggable(event: CdkDragDrop<{ gridItem: any; index: number }>) {
    this.itemsArray[event.previousContainer.data.index] =
      event.container.data.gridItem;
    this.itemsArray[event.container.data.index] =
      event.previousContainer.data.gridItem;
  }

  // async addItem(array: any, id: string) {
  //   let item = await this.itemsService.item(id);
  //   array.push(item);
  // }

  goBack() {
    this.location.back();
  }

  async changeView(type: string) {
    switch (type) {
      case 'full':
        this.newView = 'image-full-width';
        break;
      case 'description':
        this.newView = 'description-card';
        break;
      case 'simple':
        this.newView = 'simple-card';
        break;
    }
    // const newView =
    //   this.saleflowService.saleflowData.layout === 'description-card'
    //     ? 'simple-card'
    //     : 'description-card';
    const update = await this.saleflowService.updateSaleflow(
      {
        layout: this.newView,
      },
      this.saleflowService.saleflowData._id
    );
    this.saleflowService.saleflowData.layout = this.newView;
  }
}
