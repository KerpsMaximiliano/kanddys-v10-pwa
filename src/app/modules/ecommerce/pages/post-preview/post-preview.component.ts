import { Component, OnInit, ViewChild } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { SwiperComponent } from 'ngx-swiper-wrapper';
import { PostInput } from 'src/app/core/models/post';
import { Gpt3Service } from 'src/app/core/services/gpt3.service';
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
    private postsService: PostsService
  ) {}

  ngOnInit(): void {
    if (this.route.snapshot.queryParamMap.get('mode') === 'solidBg') {
      this.mode = 'solidBg';
      this.slideDescription = this.gpt3Service.gpt3Response;
    }

    const src: string = 'https://wallpapercave.com/wp/wp9100440.jpg';
    const _post: any = {
      message: 'Hace 13 años de esta foto, la recuerdo como si fuera ayer',
      title: 'Felicidades por tu tesis !!',
      from: 'test',
      to: 'tester',
      slides: [
        {
          type: 'poster',
          text: '',
          media: this._DomSanitizer.bypassSecurityTrustStyle(`
            url(${src}) center center / contain, linear-gradient(to bottom, #272727, #272727)
          `) as any,
        },
        {
          type: 'poster',
          text: '',
          media: this._DomSanitizer.bypassSecurityTrustStyle(`
            url(${src}) center center / contain, linear-gradient(to bottom, transparent, #272727)
          `) as any,
        },
        {
          type: 'poster',
          text: '',
          media: this._DomSanitizer.bypassSecurityTrustStyle(`
            url(${src}) center center / contain, linear-gradient(to bottom, transparent, #272727)
          `) as any,
        },
      ],
    };

    const storedPost = localStorage.getItem('post');

    if (storedPost) {
      this.postsService.post = JSON.parse(storedPost);
    }

    this.post = this.postsService.post;

    if ((this.post && !this.post.slides) || this.post.slides.length === 0) {
      this.mode = 'solidBg';
    }

    this.updateFrantions();
  }

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
    this.router.navigate(['ecommerce/post-edition']);
  }

  getRandomArbitrary(min, max) {
    return Math.random() * (max - min) + min;
  }

  updateCurrentSlideData(event: any) {
    this.currentMediaSlide = this.mediaSwiper.directiveRef.getIndex();
  }
}
