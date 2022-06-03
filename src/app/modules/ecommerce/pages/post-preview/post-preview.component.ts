import { Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { PostsService } from 'src/app/core/services/posts.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-post-preview',
  templateUrl: './post-preview.component.html',
  styleUrls: ['./post-preview.component.scss']
})
export class PostPreviewComponent implements OnInit {

  env: string = environment.assetsUrl;
  nameId: string = 'NameID';
  images: string[] = ['','','','','','','','',''];

  constructor(
    private postService: PostsService,
    private location: Location
  ) {
  }

  ngOnInit(): void {
  }


  goBack() {
    this.location.back();
  }


}
