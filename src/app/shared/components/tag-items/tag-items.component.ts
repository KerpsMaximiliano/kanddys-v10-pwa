import { Component, OnInit } from '@angular/core';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-tag-items',
  templateUrl: './tag-items.component.html',
  styleUrls: ['./tag-items.component.scss']
})
export class TagItemsComponent implements OnInit {

  environment: string = environment.assetsUrl;

  items: Array<any> = 
  [
    
  ]

  constructor() { }

  ngOnInit(): void {
  }

}
