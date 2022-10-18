import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import { SwiperOptions } from 'swiper';

@Component({
  selector: 'app-tags-carousell',
  templateUrl: './tags-carousell.component.html',
  styleUrls: ['./tags-carousell.component.scss'],
})
export class TagsCarousellComponent implements OnInit {
  swiperConfig: SwiperOptions = {
    slidesPerView: 3,
    freeMode: false,
    spaceBetween: 5,
  };
  @Output('tag') tag: EventEmitter<any> = new EventEmitter();
  _tag: string[] = [];
  @Input('tags') tags: any = [];
  @Input('multipleTags') multipleTags: boolean = false;
  @Input('border') border: string = '#e9e371';
  @Input('selectedBorder') selectedBorder: string = '#e9e371';
  @Input('borderWidth') borderWidth: string = '1px';
  @Input('circleBackground') circleBackground: string = '#fff';
  @Input('selectedBackground') selectedBackground: string = '#fff';
  @Input('background') background: string = 'transparent';
  @Input('_id') _id: string = '_id';
  @Input('property') property: string = 'name';
  @Input('tagTitleColor') tagTitleColor: string = '#7b7b7b';
  @Input('displayCircle') displayCircle: boolean = true;
  @Input('fontSize') fontSize:string = '15px';
  @Input('fontFamily') fontFamily:string = 'SfProDisplay';
  @Input('fontColor') fontColor:string = '#a1a1a1';
  @Input('selectedFontColor') selectedFontColor:string = '#a1a1a1';
  constructor() {}

  ngOnInit(): void {
  }

  fillList(n: number): any[] {
    const result = [...Array(n).keys()].map(() => '');
    return result;
  }
  handleTag(tag: any): void {
    this.tag.emit(tag);
    const { _id } = tag;
    if (this._tag.includes(_id))
      this._tag = this._tag.filter((tg) => tg !== _id);
    else {
      const value = this.multipleTags ? [...this._tag, _id] : [_id];
      this._tag = value;
    }
  }
}
