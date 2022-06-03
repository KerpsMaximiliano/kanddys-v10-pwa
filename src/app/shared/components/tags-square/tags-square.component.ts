import { Component, OnInit, Input } from '@angular/core';
import { environment } from 'src/environments/environment'

@Component({
  selector: 'app-tags-square',
  templateUrl: './tags-square.component.html',
  styleUrls: ['./tags-square.component.scss']
})
export class TagsSquareComponent implements OnInit {

  @Input() number: number;
  @Input() gains: number;
  @Input() tagText: string;
  imageFolder: string;
    
  constructor() { 
    this.imageFolder = environment.assetsUrl;
  }

  ngOnInit(): void {
  }

}
