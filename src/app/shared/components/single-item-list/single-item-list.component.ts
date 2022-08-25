import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { environment } from 'src/environments/environment';
import { Tag } from '../../../core/models/tags';

@Component({
  selector: 'app-single-item-list',
  templateUrl: './single-item-list.component.html',
  styleUrls: ['./single-item-list.component.scss']
})
export class SingleItemListComponent implements OnInit {
    
    @Input() image: string;
    @Input() tag?: Tag;
    @Input() alternativeName?: string;
    @Input() filter?: string;
    @Output() singleItem = new EventEmitter();
    env: string = environment.assetsUrl;
    
  constructor() { }

  ngOnInit(): void {
  }

  click(event){
    this.singleItem.emit(event)
  }

}