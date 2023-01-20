import { Component, OnInit, Input } from '@angular/core';
import { Tag } from 'src/app/core/models/tags';

@Component({
  selector: 'app-dynamic-grid',
  templateUrl: './dynamic-grid.component.html',
  styleUrls: ['./dynamic-grid.component.scss'],
})
export class DynamicGridComponent implements OnInit {
  @Input() cards: any[] = ['hola', 1, 1, 1, 1, 1, 1];

  @Input() tags: Tag[] = [];

  constructor() {}

  ngOnInit(): void {}
}
