import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Item, ItemPackage } from 'src/app/core/models/item';

@Component({
  selector: 'app-package-item',
  templateUrl: './package-item.component.html',
  styleUrls: ['./package-item.component.scss']
})
export class PackageItemComponent implements OnInit {

    @Input() package: ItemPackage;
    @Input() packageItems: Item;
    @Input() clickAble: boolean;
    @Output() action = new EventEmitter()

  constructor() { }

  ngOnInit(): void {
  }

  actionator(event){
      this.action.emit(event)
  }
}
