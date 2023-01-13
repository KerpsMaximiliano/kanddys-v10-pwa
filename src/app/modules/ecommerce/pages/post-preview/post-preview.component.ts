import { Component, OnInit, ViewChild } from '@angular/core';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { SwiperComponent } from 'ngx-swiper-wrapper';
import { PostInput } from 'src/app/core/models/post';
import { Gpt3Service } from 'src/app/core/services/gpt3.service';
import { HeaderService } from 'src/app/core/services/header.service';
import { PostsService } from 'src/app/core/services/posts.service';
import { SwiperOptions } from 'swiper';

@Component({
  selector: 'app-post-preview',
  templateUrl: './post-preview.component.html',
  styleUrls: ['./post-preview.component.scss'],
})
export class PostPreviewComponent implements OnInit {
  @ViewChild('mediaSwiper') mediaSwiper: SwiperComponent;

  currentMediaSlide: number = 0;
  fractions: string = '';
  mode: string = 'fullImg';
  post: PostInput;
  slideDescription: string = '';

  slidesPath: Array<{
    type: 'IMAGE' | 'VIDEO';
    path: string | SafeUrl;
  }> = [];

  swiperConfig: SwiperOptions = {
    slidesPerView: 1,
    freeMode: false,
    spaceBetween: 0,
  };

  constructor(
    private _DomSanitizer: DomSanitizer,
    private gpt3Service: Gpt3Service,
    private route: ActivatedRoute,
    private router: Router,
    private headerService: HeaderService,
    private postsService: PostsService
  ) {}

  async ngOnInit() {
    if (this.route.snapshot.queryParamMap.get('mode') === 'solidBg') {
      this.mode = 'solidBg';
      this.slideDescription = this.gpt3Service.gpt3Response;
    }

    const storedPost = localStorage.getItem('post');

    if (storedPost && !this.postsService.post) {
      this.postsService.post = JSON.parse(storedPost);
    }

    this.post = this.postsService.post;

    if(this.post.slides) {
      for await (const slide of this.post.slides) {
        if (slide.media.type.includes('image')) {
          const base64 = await this.fileToBase64(slide.media);
          this.slidesPath.push({
            path: `url(${base64})`,
            type: 'IMAGE',
          });
        } else {
          const fileUrl = this._DomSanitizer.bypassSecurityTrustUrl(
            URL.createObjectURL(slide.media)
          );
          this.slidesPath.push({
            path: fileUrl,
            type: 'VIDEO',
          });
        }
      }
    }


    if ((this.post && !this.post.slides) || this.post.slides.length === 0) {
      this.mode = 'solidBg';
    }

    this.updateFrantions();
  }

  fileToBase64 = (file: File) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });

  handleMode(): void {
    if (this.mode === 'gradientImg') {
      this.mode = 'fullImg';
    } else if (this.mode === 'fullImg') {
      this.mode = 'gradientImg';
    }
  }

  updateFrantions(): void {
    if (this.post.slides) {
      this.fractions = this.post.slides
        .map(
          () =>
            `${
              this.post.slides.length < 3
                ? '1'
                : this.getRandomArbitrary(0, this.post.slides.length)
            }fr`
        )
        .join(' ');
    }
  }

  topBtnAction() {
    this.router.navigate([
      'ecommerce/' + this.headerService.saleflow._id + '/post-edition',
    ]);
  }

  getRandomArbitrary(min, max) {
    return Math.random() * (max - min) + min;
  }

  updateCurrentSlideData(event: any) {
    this.currentMediaSlide = this.mediaSwiper.directiveRef.getIndex();
  }
}
