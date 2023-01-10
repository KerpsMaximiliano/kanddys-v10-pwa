import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HeaderService } from 'src/app/core/services/header.service';
import { MerchantsService } from 'src/app/core/services/merchants.service';
import { PostsService } from 'src/app/core/services/posts.service';
import { environment } from 'src/environments/environment';
import { FormBuilder } from '@angular/forms';
import { SwiperOptions, Swiper } from 'swiper';

@Component({
  selector: 'app-text-edition-and-preview',
  templateUrl: './text-edition-and-preview.component.html',
  styleUrls: ['./text-edition-and-preview.component.scss'],
})
export class TextEditionAndPreviewComponent implements OnInit {
  title: string;
  description: string;
  numeration = [];
  env: string = environment.assetsUrl;
  currentMessageIndex: number = 0;
  mode: 'PREVIEW' | 'EDIT' = 'PREVIEW';
  swiperConfig: SwiperOptions = {
    slidesPerView: 1,
  };

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    public postService: PostsService,
    private fb: FormBuilder
  ) {}

  messageForm = this.fb.group({
    title: '',
    message: '',
  });

  ngOnInit(): void {
    this.route.queryParams.subscribe(async (queryParams) => {
      const { type } = queryParams;

      if (!type || type === 'post') {
        const options = JSON.parse(
          localStorage.getItem('temporal-post-options')
        );
        const firstStoredPostMessage = options[0];
        this.postService.postMessageOptions = options;
        this.description =
          firstStoredPostMessage.message ||
          this.postService.postMessageOptions[0].message;
        this.title =
          firstStoredPostMessage.title ||
          this.postService.postMessageOptions[0].title;
      }
    });
  }

  switchToMode(mode: 'EDIT' | 'PREVIEW') {
    this.mode = mode;

    if (this.mode === 'EDIT') {
      this.messageForm.patchValue({
        title: this.title,
        message: this.description,
      });
    }
  }

  goBack() {}
}
