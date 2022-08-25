import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Item, ItemPackage } from 'src/app/core/models/item';

@Component({
  selector: 'app-item-grid',
  templateUrl: './item-grid.component.html',
  styleUrls: ['./item-grid.component.scss']
})
export class ItemGridComponent implements OnInit {
  @Input() items: any = [];
  @Input() mode: string = 'basic'
  @Input() gridStyle: number = 1;
  @Output() eventEmitter = new EventEmitter();
  counter: any[] = [this.items,this.items,this.items]

  constructor() { }

  ngOnInit(): void {
  }

  onClick(index: number) {
    this.eventEmitter.emit(index);
  }

}
