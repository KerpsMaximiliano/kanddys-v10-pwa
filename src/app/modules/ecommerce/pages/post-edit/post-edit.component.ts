import { Component, OnInit } from '@angular/core';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-post-edit',
  templateUrl: './post-edit.component.html',
  styleUrls: ['./post-edit.component.scss']
})
export class PostEditComponent implements OnInit {

    imageFolder : string;
    inPreview: boolean = true;
    mode: string = 'pos';
    image: string;

  constructor() { 
      this.imageFolder = environment.assetsUrl;
  }

  ngOnInit(): void {
  }

}
