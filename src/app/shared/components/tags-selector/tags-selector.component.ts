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
