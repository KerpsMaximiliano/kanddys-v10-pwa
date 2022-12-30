import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { SwiperComponent } from 'ngx-swiper-wrapper';
import { PostInput } from 'src/app/core/models/post';
import { SwiperOptions } from 'swiper';

@Component({
  selector: 'app-factura-preview',
  templateUrl: './factura-preview.component.html',
  styleUrls: ['./factura-preview.component.scss'],
})
export class FacturaPreviewComponent implements OnInit {
  @ViewChild('mediaSwiper') mediaSwiper: SwiperComponent;
  fullImage: boolean = false;
  gradient: boolean = true;
  post:PostInput;
  fractions: string = '';
  currentMediaSlide:number = 0;

  mode: string = 'fullImg';
  swiperConfig: SwiperOptions = {
    slidesPerView: 1,
    freeMode: false,
    spaceBetween: 0,
  };
  constructor(private _DomSanitizer: DomSanitizer) {}

  ngOnInit(): void {
    const src:string = 'https://wallpapercave.com/wp/wp9100440.jpg';
    const _post:any = {
      message: 'Hace 13 años de esta foto, la recuerdo como si fuera ayer',
      title: 'Felicidades por tu tesis !!',
      from: 'test',
      to: 'tester',
      slides: [
        {
          type: 'poster',
          text: '',
          media: this._DomSanitizer.bypassSecurityTrustStyle(`
            url(${src}) center center / contain, linear-gradient(to bottom, transparent, #272727)
          `) as any
        },
        {
          type: 'poster',
          text: '',
          media: this._DomSanitizer.bypassSecurityTrustStyle(`
            url(${src}) center center / contain, linear-gradient(to bottom, transparent, #272727)
          `) as any
        },
        {
          type: 'poster',
          text: '',
          media: this._DomSanitizer.bypassSecurityTrustStyle(`
            url(${src}) center center / contain, linear-gradient(to bottom, transparent, #272727)
          `) as any
        }
      ]
    };
    this.post = _post;
    this.updateFrantions();
  }

  handleMode():void {
    this.mode = 'gradientImg';
  }

  updateFrantions(): void {
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

  getRandomArbitrary(min, max) {
    return Math.random() * (max - min) + min;
  }

  updateCurrentSlideData(event: any) {
    this.currentMediaSlide = this.mediaSwiper.directiveRef.getIndex();
  }
}
