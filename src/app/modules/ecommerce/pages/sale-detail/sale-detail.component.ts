import { Component, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-sale-detail',
  templateUrl: './sale-detail.component.html',
  styleUrls: ['./sale-detail.component.scss']
})
export class SaleDetailComponent implements OnInit {

  env: string = environment.assetsUrl;
  backgroundImg: string = "";
  categories: any = [
    {
      name: "Category 1",
      sales: 10
    },
    {
      name: "Category 2",
      sales: 17
    },
    {
      name: "Category 3",
      sales: 21
    },
    {
      name: "Category 4",
      sales: 3
    },
    {
      name: "Category 5",
      sales: 11
    },
  ]

  constructor(private location: Location) { }

  ngOnInit(): void {
  }

  redirect() {
    
    this.location.back();
  }

}
