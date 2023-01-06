import { Component, OnInit } from '@angular/core';
import { CdkDragDrop } from '@angular/cdk/drag-drop';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-qr-edit',
  templateUrl: './qr-edit.component.html',
  styleUrls: ['./qr-edit.component.scss']
})
export class QrEditComponent implements OnInit {

  environment: string = environment.assetsUrl;
  


  gridArray: Array<any> = [
    {
      background:'https://storage-rewardcharly.sfo2.digitaloceanspaces.com/item-images/16703498602455c99b82c99f1c4d5b61e47a4f9dc23cb42d784fe03594cb2d718ff2ceac8624d.png',
      text: 'Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet.',
      label: 'Text'
    },
    {
      background: this.environment + '/noimage.png',
      label: 'Text'
    },
    {
      background: this.environment + '/abeja04.png',
      text: 'Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet.',
      label: 'Text'
    },
    {
      background: this.environment + '/noimage.png',
      label: 'Text'
    },
    {
      background:'https://storage-rewardcharly.sfo2.digitaloceanspaces.com/item-images/16703498602455c99b82c99f1c4d5b61e47a4f9dc23cb42d784fe03594cb2d718ff2ceac8624d.png',
      text: 'Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet.',
      label: 'Text'
    },
  ];

  constructor() { }

  ngOnInit(): void {
  }

  async dropTagDraggable(event: CdkDragDrop<{ gridItem: any; index: number }>) {
    this.gridArray[event.previousContainer.data.index] =
      event.container.data.gridItem;
    this.gridArray[event.container.data.index] =
      event.previousContainer.data.gridItem;
  }
}
