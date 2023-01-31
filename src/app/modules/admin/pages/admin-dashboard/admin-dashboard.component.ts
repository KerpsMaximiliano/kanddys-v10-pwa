import { Component, OnInit } from '@angular/core';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.scss']
})
export class AdminDashboardComponent implements OnInit {

  environment: string = environment.assetsUrl;

  tags: Array<any> = ["articulos", "categorias", "colecciones"];
  selected: number = 0

  constructor() { }

  ngOnInit(): void {
  }

  selectTag(index: number){
    if(index!= this.selected){
      this.selected = index;
    }
  }
}
