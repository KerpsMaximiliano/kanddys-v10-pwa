import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { environment } from 'src/environments/environment'; 

@Component({
  selector: 'app-tags-selector',
  templateUrl: './tags-selector.component.html',
  styleUrls: ['./tags-selector.component.scss'],
})
export class TagsSelectorComponent implements OnInit {
  @Input('tags') tags: any[] = [];
  tag: string[] = [];
  @Input() activeTags: any[];
  @Input() useIdToRemoveOrAddTags: boolean = false;
  @Input('multipleTags') multipleTags: boolean = false;
  @Input('containerBackground') containerBackground: string = '#2874ad';
  @Input('background') background: string = '#fff';
  @Input('selectedBackground') selectedBackground: string = '#2874ad';
  @Input('selectedFilter') selectedFilter: string = 'brightness(2)';
  @Input('color') color: string = '#fff';
  @Input('selectedColor') selectedColor: string = '#2874ad';
  env: string = environment.assetsUrl;

  @Output() tagSelect: EventEmitter<any> = new EventEmitter();

  setTag(tag): void {
    if (this.useIdToRemoveOrAddTags) {
      if (this.tag.includes(tag._id))
        this.tag = this.tag.filter((tagId) => tagId !== tag._id);
      else {
        const value = this.multipleTags ? [...this.tag, tag._id] : [tag._id];
        this.tag = value;
      }
    } else {
      if (this.tag.includes(tag))
        this.tag = this.tag.filter((tagFromArray) => tagFromArray !== tag);
      else {
        const value = this.multipleTags ? [...this.tag, tag] : [tag];
        this.tag = value;
      }
    }
    this.tagSelected(tag);
  }

  tagSelected(args?: any) {
    this.tagSelect.emit(args);
  }

  constructor() {}

  ngOnInit(): void {
    if (
      this.multipleTags &&
      ((this.activeTags && this.activeTags !== undefined) ||
        (null && this.activeTags.length >= 1))
    ) {
      this.discriminator('_id');
    }
  }

  discriminator(id: string) {
    this.tags.forEach((tag) => {
      this.activeTags.includes(tag[id]) ? this.tag.push(tag[id]) : null;
    });
  }
}
