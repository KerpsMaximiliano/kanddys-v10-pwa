import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-item-card',
  templateUrl: './item-card.component.html',
  styleUrls: ['./item-card.component.scss']
})
export class ItemCardComponent implements OnInit {
  @Input() boxAmount: number;
  @Input() image: string;
  @Input() price?: number;
  @Input() income?: number;
  @Input() showBox: boolean;
  @Input() showIcon: boolean;
  @Input() isSelected: boolean;
  @Output() changeSelection = new EventEmitter();
  @Output() itemClicked = new EventEmitter();

  env: string = environment.assetsUrl;

  constructor() {}

  ngOnInit(): void {
  }

  onClick() {
    this.itemClicked.emit()
  }

  onTopBoxClick() {
    //
  }

  onIconClick() {
    //
  }

  onSelectedClick() {
    this.changeSelection.emit();
  }

}
