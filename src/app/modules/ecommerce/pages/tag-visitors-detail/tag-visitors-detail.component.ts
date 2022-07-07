import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-tag-visitors-detail',
  templateUrl: './tag-visitors-detail.component.html',
  styleUrls: ['./tag-visitors-detail.component.scss']
})
export class TagVisitorsDetailComponent implements OnInit {

  dummyVisitors: any[] = [
    {
      name: "Pedro Pérez",
      answers: 8
    },
    {
      name: "Pedro Pérez",
      answers: 8
    },
    {
      name: "Pedro Pérez",
      answers: 8
    },
    {
      name: "Pedro Pérez",
      answers: 8
    },
    {
      name: "Pedro Pérez",
      answers: 8
    },
    {
      name: "Pedro Pérez",
      answers: 8
    }
  ]

  constructor() { }

  ngOnInit(): void {
  }

  back() {
    console.log("Atrás");
  }

}
