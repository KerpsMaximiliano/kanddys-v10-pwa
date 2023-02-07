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
  type: 'POST' | 'AI-JOKE' = 'POST';
  returnTo: 'checkout' | 'post-edition' | 'article-editor' = null;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    public postService: PostsService,
    public headerService: HeaderService,
    private fb: FormBuilder,
    private dialogFlowService: DialogFlowService
  ) {}

  messageForm = this.fb.group({
    title: '',
    message: '',
  });

  jokeForm = this.fb.group({
    joke: '',
  });

  ngOnInit(): void {
    this.route.queryParams.subscribe(async (queryParams) => {
      const { type, returnTo } = queryParams;
      this.type = type.toUpperCase();
      this.returnTo = returnTo as any;

      if (!type || this.type === 'POST') {
        const storedOptions = localStorage.getItem('temporal-post-options');

        if (!storedOptions) {
          this.router.navigate([
            'ecommerce/' + this.headerService.saleflow.merchant.slug + '/store',
          ]);
        }

        const options = JSON.parse(storedOptions);
        const firstStoredPostMessage = options[0];
        this.postService.postMessageOptions = options;
        this.description =
          firstStoredPostMessage.message ||
          this.postService.postMessageOptions[0].message;
        this.title =
          firstStoredPostMessage.title ||
          this.postService.postMessageOptions[0].title;
      } else if (this.type === 'AI-JOKE') {
        const storedOptions = localStorage.getItem('aiJokes');

        if (!storedOptions) {
          this.router.navigate([
            'ecommerce/' + this.headerService.saleflow.merchant.slug + '/store',
          ]);
        }

        const options = JSON.parse(storedOptions);
        this.headerService.aiJokes = options;

        this.description = this.headerService.aiJokes[0];
      }
    });
  }

  switchToMode(mode: 'EDIT' | 'PREVIEW') {
    this.mode = mode;

    if (this.mode === 'EDIT' && this.type === 'POST') {
      this.messageForm.patchValue({
        title:
          this.postService.postMessageOptions[this.currentMessageIndex].title,
        message:
          this.postService.postMessageOptions[this.currentMessageIndex].message,
      });
    } else if (this.mode === 'EDIT' && this.type === 'AI-JOKE') {
      this.jokeForm.patchValue({
        joke: this.headerService.aiJokes[this.currentMessageIndex],
      });
    }

    setTimeout(() => {
      let cssClass: string;
      if (this.type === 'AI-JOKE') {
        cssClass = '.paragraphs-edit';
      } else {
        cssClass = '.title-edit';
      }

      const nodeList = document.querySelectorAll(cssClass);

      const textarea: HTMLInputElement = nodeList.item(
        this.currentMessageIndex
      ) as HTMLInputElement;

      textarea.focus();
    }, 300);
    /*
   
    */
  }

  changeSlide(eventData: Swiper) {
    const currentDialogIndex = eventData.activeIndex;
    this.currentMessageIndex = currentDialogIndex;

    if (this.mode === 'EDIT' && this.type === 'POST') {
      this.messageForm.patchValue({
        title: this.postService.postMessageOptions[currentDialogIndex].title,
        message:
          this.postService.postMessageOptions[currentDialogIndex].message,
      });
    } else if (this.mode === 'EDIT' && this.type === 'AI-JOKE') {
      this.jokeForm.patchValue({
        joke: this.headerService.aiJokes[this.currentMessageIndex],
      });
    }
  }

  saveMessage() {
    if (!this.postService.post) this.postService.post = {};
    if (this.type === 'POST') {
      if (this.mode === 'EDIT') {
        const title = this.messageForm.get('title').value;
        const message = this.messageForm.get('message').value;

        this.postService.post.message = message;
        this.postService.post.title = title;
      } else {
        this.postService.post.message = this.description;
        this.postService.post.title = this.title;
      }
    } else if (this.type === 'AI-JOKE') {
      if (this.mode === 'EDIT') {
        const joke = this.jokeForm.get('joke').value;
        this.postService.post.joke = joke;
      } else {
        this.postService.post.joke =
          this.headerService.aiJokes[this.currentMessageIndex];
      }

      if (
        !this.postService.post.slides ||
        this.postService.post.slides.length === 0
      ) {
        this.postService.post.slides = [];
        this.postService.post.slides = [
          {
            type: 'text',
            text: this.postService.post.joke,
            index: 0,
            title: 'Chiste de IA',
            media: null,
          },
        ];
      } else {
        this.postService.post.slides.push({
          type: 'text',
          text: this.postService.post.joke,
          index: this.postService.post.slides.length - 1,
          title: 'Chiste de IA',
          media: null,
        });
      }
    }

    localStorage.setItem(
      'post',
      JSON.stringify({
        message: this.postService.post.message,
        title: this.postService.post.title,
        to: this.postService.post.to,
        from: this.postService.post.from,
        joke: this.postService.post.joke,
      })
    );

    localStorage.removeItem('temporal-post-options');
    localStorage.removeItem('aiJokes');

    this.dialogFlowService.previouslyActiveDialogId =
      this.dialogFlowService.activeDialogId;

    if (!this.returnTo) this.redirectFromQueryParams();
    else if (this.returnTo === 'checkout') {
      const queryParams: any = {
        startOnDialogFlow: true,
        addedQr: true,
        addedAIJoke: this.type === 'AI-JOKE',
      };
      if (this.type === 'POST') queryParams.addedPhotos = true;
      if (this.type === 'AI-JOKE') queryParams.addedAIJoke = true;

      this.router.navigate(
        ['ecommerce', this.headerService.saleflow.merchant.slug, 'checkout'],
        {
          queryParams,
        }
      );
    } else if (this.returnTo === 'post-edition') {
      this.router.navigate([
        'ecommerce/' +
          this.headerService.saleflow.merchant.slug +
          '/post-edition',
      ]);
    }
  }

  back() {
    this.redirectFromQueryParams();
  }

  redirectFromQueryParams() {
    let redirectionRoute = this.headerService.flowRoute;

    if (!redirectionRoute) redirectionRoute = localStorage.getItem('flowRoute');

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
