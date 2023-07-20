import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-tag-filtering',
  templateUrl: './tag-filtering.component.html',
  styleUrls: ['./tag-filtering.component.scss'],
})
export class TagFilteringComponent implements OnInit {
  categories = [
    { id: 1, name: 'CategoryId', selected: false },
    { id: 2, name: 'CategoryId', selected: false },
    { id: 3, name: 'CategoryId', selected: false },
    { id: 4, name: 'CategoryId', selected: false },
    { id: 5, name: 'CategoryId', selected: false },
    { id: 6, name: 'CategoryId', selected: false },
    { id: 7, name: 'CategoryId', selected: false },
    { id: 8, name: 'CategoryId', selected: false },
  ];
  constructor() {}

  ngOnInit(): void {}

  select(id) {
    this.categories.forEach((e) => {
      if (e.id == id) {
        e.selected = !e.selected;
      }
    });
  }
}
