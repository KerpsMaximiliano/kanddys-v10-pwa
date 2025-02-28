import { Component, OnInit, Input } from '@angular/core';
import { environment } from 'src/environments/environment'

@Component({
  selector: 'app-tags-square',
  templateUrl: './tags-square.component.html',
  styleUrls: ['./tags-square.component.scss']
})
export class TagsSquareComponent implements OnInit {

  @Input() number: string;
  @Input() gains: string;
  @Input() tagText: string;
  @Input() color: string = '#40772F';
  @Input() textColor: string = '#7B7B7B';
  @Input() bColor: string;
  @Input() position: 'center' | 'left'| 'right' = 'center';
  @Input() centered: boolean = false;
  @Input() reverse: boolean= false;
  @Input() size: string;
  imageFolder: string;
    
  constructor() { 
    this.imageFolder = environment.assetsUrl;
  }

  ngOnInit(): void {
  }

}
