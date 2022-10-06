import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { SwiperOptions } from 'swiper';

@Component({
  selector: 'app-tags-carousell',
  templateUrl: './tags-carousell.component.html',
  styleUrls: ['./tags-carousell.component.scss']
})
export class TagsCarousellComponent implements OnInit {
  swiperConfig: SwiperOptions = {
    slidesPerView: 3,
    freeMode: false,
    spaceBetween: 5,
  };
  @Output('tag') tag:EventEmitter<any> = new EventEmitter();
  tags: string[] = [];
  constructor() { }

  ngOnInit(): void {
    this.tags = this.fillList(10).map(
      (i: string, index: number) => `#tacomid${index}`
    );
  }

  fillList(n: number): any[] {
    const result = [...Array(n).keys()].map(() => '');
    return result;
  }
  handleTag(tag:string):void {
    this.tag.emit(tag);
  }
}
