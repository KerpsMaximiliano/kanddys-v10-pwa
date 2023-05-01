import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-data-display',
  templateUrl: './data-display.component.html',
  styleUrls: ['./data-display.component.scss'],
})
export class DataDisplayComponent implements OnInit {
  @Input() title1: string = '';
  @Input() title2: string = '';
  @Input() title3: string = '';
  @Input() data1: string = '';
  @Input() data2: string = '';
  @Input() data3: string = '';

  constructor() {}

  ngOnInit(): void {}
}
