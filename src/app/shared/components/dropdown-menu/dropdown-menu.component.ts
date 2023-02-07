import { Component, OnInit, Input } from '@angular/core';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'app-dropdown-menu',
  templateUrl: './dropdown-menu.component.html',
  styleUrls: ['./dropdown-menu.component.scss'],
})
export class DropdownMenuComponent implements OnInit {
  constructor() {}

  panelOpenState = false;
  @Input() mode: string = 'multi-select';
  @Input() boldList: boolean = true;
  @Input() title: string = 'Status de la Factura';
  @Input() logo: string = '';
  @Input() listTitle: string = 'Titulo de Lista';
  options = new FormControl('');
  @Input() optionsList = [
    { text: 'Lista NameID', selected: false },
    { text: 'Lista NameID', selected: false },
    { text: 'Lista NameID', selected: false },
    { text: 'Lista NameID', selected: false },
    { text: 'Lista NameID', selected: false },
    { text: 'Lista NameID', selected: false },
  ];

  ngOnInit(): void {}

  toggleSelected(i: number) {
    this.optionsList[i].selected = !this.optionsList[i].selected;
  }
}
