import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-tags-selector',
  templateUrl: './tags-selector.component.html',
  styleUrls: ['./tags-selector.component.scss'],
})
export class TagsSelectorComponent implements OnInit {
  @Input('tags') tags: string[] = [];
  tag: string[] = [];
  @Input('multipleTags') multipleTags: boolean = false;
  @Input('containerBackground') containerBackground:string = '#2874ad';
  @Input('background') background:string = '#fff';
  @Input('selectedBackground') selectedBackground:string = '#2874ad';
  @Input('color') color:string = '#fff';
  @Input('selectedColor') selectedColor:string = '#2874ad';

  setTag(tag): void {
    if (this.tag.includes(tag)) this.tag = this.tag.filter((tg) => tg !== tag);
    else {
      const value = this.multipleTags ? [...this.tag, tag] : [tag];
      this.tag = value;
    }
  }

  constructor() {}

  ngOnInit(): void {
  }
}
