import { Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Tag } from 'src/app/core/models/tags';

const dummyVisitors = [
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
  },
  {
    name: "Pedro Pérez",
    answers: 8
  }
]

@Component({
  selector: 'app-tag-visitors-detail',
  templateUrl: './tag-visitors-detail.component.html',
  styleUrls: ['./tag-visitors-detail.component.scss']
})
export class TagVisitorsDetailComponent implements OnInit {
  tag: Tag;
  visitors: any[] = dummyVisitors;

  constructor(
    private router: Router,
    private location: Location,
  ) {
    this.tag = this.router.getCurrentNavigation().extras.state?.tag;
  }

  ngOnInit(): void {
    if(!this.tag) this.location.back();
  }

  back() {
    this.location.back();
  }

}
