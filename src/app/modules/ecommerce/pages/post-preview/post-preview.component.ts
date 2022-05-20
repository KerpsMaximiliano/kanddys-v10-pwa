import { Component, OnInit } from '@angular/core';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-post-preview',
  templateUrl: './post-preview.component.html',
  styleUrls: ['./post-preview.component.scss']
})
export class PostPreviewComponent implements OnInit {

    imageFolder : string;
    inPreview: boolean = true;
    mode: string = 'poster';
    image: string;

  constructor() { 
      this.imageFolder = environment.assetsUrl;
  }

  ngOnInit(): void {
  }

}
