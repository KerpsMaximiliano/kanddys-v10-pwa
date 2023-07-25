import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-order-progress',
  templateUrl: './order-progress.component.html',
  styleUrls: ['./order-progress.component.scss']
})
export class OrderProgressComponent implements OnInit {

  progress = [
    { id: 1, name: 'progressId(23)', selected: true },
    { id: 2, name: 'progressId(12)', selected: false },
    { id: 3, name: 'progressId(53)', selected: false },
    { id: 4, name: 'progressId(76)', selected: false },
  ];
  constructor() {}

  ngOnInit(): void {}

  select(id) {
    this.progress.forEach((e) => {
      if (e.id == id) {
        e.selected = !e.selected;
      }
    });
  }

}
