import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Item, ItemPackage } from 'src/app/core/models/item';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-package-item',
  templateUrl: './package-item.component.html',
  styleUrls: ['./package-item.component.scss']
})
export class PackageItemComponent implements OnInit {

  @Input() buttonSize: 'normal' | 'small' = 'normal';
  @Input() package: ItemPackage;
  @Input() packageItems: Item;
  @Input() clickAble: boolean;
  @Input() item: Item;
  @Output() action = new EventEmitter();
  @Output() itemClicked = new EventEmitter();
  env: string = environment.assetsUrl;

  constructor() { }

  ngOnInit(): void {}

  onClick(id: string) {
    console.log("clickkasd")
    this.action.emit(id);
  }

  onButtonClick(id: string) {
    this.action.emit(id);
  }
}
