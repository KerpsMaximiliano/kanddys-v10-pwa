import { Component, OnInit } from '@angular/core';
import { forEach } from 'jszip';
import { ItemsService } from 'src/app/core/services/items.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.scss']
})
export class AdminDashboardComponent implements OnInit {

  environment: string = environment.assetsUrl;
  artID: Array<string> = 
  [
    "63d429d7849f894c1895c659",
    "63d420a8849f894c189544d4",
    "63c93768a6ce9322ca278888",
    "63c61f50a6ce9322ca216714"
  ]
  articulos: Array<any> = []

  tags: Array<any> = 
  [
    {title:'articulos', dotsIcon: true},
    {title:'categorias', dotsIcon: true}, 
    {title:'colecciones', dotsIcon: true}
  ];
  selected: number = 0

  constructor(private itemsService: ItemsService) { }

  async ngOnInit(){
    
    this.artID.forEach(async element => {
      let item = await this.itemsService.item(element)
      this.articulos
  .push(item);
      
    });
    
  }

  selectTag(index: number){
    if(index!= this.selected){
      this.selected = index;
    }
  }
}
