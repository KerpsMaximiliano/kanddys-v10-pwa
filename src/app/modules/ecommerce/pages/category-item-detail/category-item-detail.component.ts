import { Component, OnInit } from '@angular/core';
import { environment } from 'src/environments/environment'

@Component({
  selector: 'app-category-item-detail',
  templateUrl: './category-item-detail.component.html',
  styleUrls: ['./category-item-detail.component.scss']
})
export class CategoryItemDetailComponent implements OnInit {

  imgUrl: string ='https://i.imgur.com/SufVLiV.jpeg';
  categoryList: string[] = ['', '', '', '']
  env: string = environment.assetsUrl;
  constructor() { }

  ngOnInit(): void {
  }

}
