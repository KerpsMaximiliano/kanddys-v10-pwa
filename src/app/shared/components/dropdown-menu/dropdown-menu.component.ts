import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormControl } from '@angular/forms';

export interface DropdownOptionItem {
  text: string;
  value: string;
  selected: boolean;
  hide?: boolean;
}

@Component({
  selector: 'app-dropdown-menu',
  templateUrl: './dropdown-menu.component.html',
  styleUrls: ['./dropdown-menu.component.scss'],
})
export class DropdownMenuComponent implements OnInit {
  constructor() {}

  panelOpenState = false;
  @Input() multiple: boolean = true;
  @Input() boldList: boolean = true;
  @Input() title: string;
  @Input() logo: string = '';
  @Input() listTitle: string;
  options = new FormControl('');
  @Input() optionsList: DropdownOptionItem[] = [];
  @Output() listValue = new EventEmitter();
  @Output() panelState = new EventEmitter();

  ngOnInit(): void {}

  togglePanel(open: boolean) {
    this.panelOpenState = open;
    this.panelState.emit(open);
  }

  toggleSelected(i: number) {
    this.optionsList[i].selected = !this.optionsList[i].selected;
    if (!this.multiple) {
      this.optionsList.forEach((option, index) => {
        option.selected = index === i;
      });
    }
    this.listValue.emit(this.optionsList[i].value);
  }
}
