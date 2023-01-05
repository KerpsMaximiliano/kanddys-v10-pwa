import { Component, Input, OnInit, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-options-grid',
  templateUrl: './options-grid.component.html',
  styleUrls: ['./options-grid.component.scss'],
})
export class OptionsGridComponent implements OnInit {
  @Input() words = [];
  @Input() title = '';
  @Input() mode = 'default';
  @Input('containerStyles') containerStyles: Record<string, string>;
  @Input() titleCenter: boolean = true;
  @Output() optionClick = new EventEmitter();

  constructor() {}

  ngOnInit(): void {}

  cardClicked(text: string) {
    this.optionClick.emit(text);
  }
}
