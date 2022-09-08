import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

const options = [
  {
    value: 'text',
    name: 'Texto',
  },
  {
    value: 'media',
    name: 'Imagen',
  },
  {
    value: 'number',
    name: 'Número',
  },
];

@Component({
  selector: 'app-select-dropdown',
  templateUrl: './select-dropdown.component.html',
  styleUrls: ['./select-dropdown.component.scss'],
})
export class SelectDropdownComponent implements OnInit {
  @Input() text: string;
  @Input() options = options;
  @Output() onOptionSelection = new EventEmitter<number>();
  isActive: boolean;
  selectedIndex: number = 0;

  constructor() {}

  ngOnInit(): void {}

  selectOption(index: number) {
    this.selectedIndex = index;
    this.isActive = !this.isActive;
    this.onOptionSelection.emit(index);
  }
}
