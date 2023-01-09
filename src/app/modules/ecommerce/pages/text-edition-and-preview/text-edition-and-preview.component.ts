import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HeaderService } from 'src/app/core/services/header.service';
import { MerchantsService } from 'src/app/core/services/merchants.service';
import { PostsService } from 'src/app/core/services/posts.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-text-edition-and-preview',
  templateUrl: './text-edition-and-preview.component.html',
  styleUrls: ['./text-edition-and-preview.component.scss'],
})
export class TextEditionAndPreviewComponent implements OnInit {
  description: string;
  numeration = [];
  env: string = environment.assetsUrl;
  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private postService: PostsService
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(async (queryParams) => {
      const { type } = queryParams;

      if (!type || type === 'post') {
        this.description = this.postService.post.message;
      }
    });
  }

  goBack() {}
}
