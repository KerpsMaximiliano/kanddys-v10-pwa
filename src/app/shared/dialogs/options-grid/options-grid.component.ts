import { Component, Input, OnInit } from '@angular/core';

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

  constructor() {}

  ngOnInit(): void {}
}
