import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HeaderService } from 'src/app/core/services/header.service';
import { MerchantsService } from 'src/app/core/services/merchants.service';
import { PostsService } from 'src/app/core/services/posts.service';
import { environment } from 'src/environments/environment';
import { FormBuilder } from '@angular/forms';
import { SwiperOptions, Swiper } from 'swiper';
import { DialogFlowService } from 'src/app/core/services/dialog-flow.service';

@Component({
  selector: 'app-text-edition-and-preview',
  templateUrl: './text-edition-and-preview.component.html',
  styleUrls: ['./text-edition-and-preview.component.scss'],
})
export class TextEditionAndPreviewComponent implements OnInit {
  URI: string = environment.uri;
  env: string = environment.assetsUrl;
  title: string;
  description: string;
  numeration = [];
  currentMessageIndex: number = 0;
  mode: 'PREVIEW' | 'EDIT' = 'PREVIEW';
  swiperConfig: SwiperOptions = {
    slidesPerView: 1,
  };

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    public postService: PostsService,
    private headerService: HeaderService,
    private fb: FormBuilder,
    private dialogFlowService: DialogFlowService
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
        title:
          this.postService.postMessageOptions[this.currentMessageIndex].title,
        message:
          this.postService.postMessageOptions[this.currentMessageIndex].message,
      });
    }
  }

  changeSlide(eventData: Swiper) {
    const currentDialogIndex = eventData.activeIndex;
    this.currentMessageIndex = currentDialogIndex;

    if (this.mode === 'EDIT') {
      this.messageForm.patchValue({
        title: this.postService.postMessageOptions[currentDialogIndex].title,
        message:
          this.postService.postMessageOptions[currentDialogIndex].message,
      });
    }
  }

  saveMessage() {
    if (!this.postService.post) this.postService.post = {};
    if (this.mode === 'EDIT') {
      const title = this.messageForm.get('title').value;
      const message = this.messageForm.get('message').value;

      this.postService.post.message = message;
      this.postService.post.title = title;
    } else {
      this.postService.post.message = this.description;
      this.postService.post.title = this.title;
    }

    this.dialogFlowService.previouslyActiveDialogId =
      this.dialogFlowService.activeDialogId;

    this.redirectFromQueryParams();
  }

  redirectFromQueryParams() {
    const redirectionRoute = this.headerService.flowRoute;

    if (redirectionRoute.includes('?')) {
      const redirectURL: { url: string; queryParams: Record<string, string> } =
        { url: null, queryParams: {} };
      const routeParts = redirectionRoute.split('?');
      const redirectionURL = routeParts[0];
      const routeQueryStrings = routeParts[1].split('&').map((queryString) => {
        const queryStringElements = queryString.split('=');

        return { [queryStringElements[0]]: queryStringElements[1] };
      });

      redirectURL.url = redirectionURL;
      redirectURL.queryParams = {};

      routeQueryStrings.forEach((queryString) => {
        const key = Object.keys(queryString)[0];
        redirectURL.queryParams[key] = queryString[key];
      });

      this.router.navigate([redirectURL.url], {
        queryParams: redirectURL.queryParams,
        replaceUrl: true,
      });
    } else {
      this.router.navigate([redirectionRoute], {
        replaceUrl: true,
      });
    }
  }

  goBack() {}
}
