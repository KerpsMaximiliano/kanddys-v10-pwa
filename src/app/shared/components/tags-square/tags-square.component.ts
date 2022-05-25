import { Component, OnInit, Input } from '@angular/core';
import { environment } from 'src/environments/environment'

@Component({
  selector: 'app-tags-square',
  templateUrl: './tags-square.component.html',
  styleUrls: ['./tags-square.component.scss']
})
export class TagsSquareComponent implements OnInit {

  @Input() number: number = 154;
  @Input() gains: string = '1, 154.23'
  @Input() tagText: string[] = ['Tag ID', 'Tag ID'];
  imageFolder: string;
    
  constructor() { 
    this.imageFolder = environment.assetsUrl;
  }

  ngOnInit(): void {
  }

}
