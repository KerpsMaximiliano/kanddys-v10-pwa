import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-tags-selector',
  templateUrl: './tags-selector.component.html',
  styleUrls: ['./tags-selector.component.scss'],
})
export class TagsSelectorComponent implements OnInit {
  @Input('tags') tags: any[] = [];
  @Input('fillSelectedTagsOnStart') fillSelectedTagsOnStart: boolean;
  @Input('selectedTagsIds') tag: string[] = [];
  @Input() activeTags: any[];
  @Input() useIdToRemoveOrAddTags: boolean = false;
  @Input('multipleTags') multipleTags: boolean = false;
  @Input('containerBackground') containerBackground: string = '#2874ad';
  @Input('background') background: string = '#fff';
  @Input() inactiveBackground: string;
  @Input() inactiveColor: string = '';
  @Input() notificationBackground: string = 'rgba(123, 123, 123, 37%)';
  @Input() notificationColor: string = 'rgba(123, 123, 123, 37%)';
  @Input('selectedBackground') selectedBackground: string = '#2874ad';
  @Input('selectedFilter') selectedFilter: string = 'brightness(2)';
  @Input('color') color: string = '#fff';
  @Input('selectedColor') selectedColor: string = '#2874ad';
  @Input('outputAllSelectedTags') outputAllSelectedTags: boolean = false;
  @Input('useAlternativeOutput') useAlternativeOutput: boolean;
  env: string = environment.assetsUrl;

  @Output() tagSelect: EventEmitter<any> = new EventEmitter();
  @Output() tagSelect2: EventEmitter<any> = new EventEmitter();
  @Output() tagSelect3: EventEmitter<any> = new EventEmitter();

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

    console.log('sacar todos los tags', this.outputAllSelectedTags);

    if (!this.outputAllSelectedTags)
      this.tagSelected(tag, this.tag.includes(tag));
    else {
      this.tagSelect3.emit({
        selectedTags: this.tag,
      });
    }
  }

  tagSelected(args: any, selected: boolean) {
    if (!this.useAlternativeOutput) this.tagSelect.emit(args);
    else
      this.tagSelect2.emit({
        tag: args,
        selected,
      });
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

  getTagIcon(status: string) {
    return status === 'disabled'
      ? this.env + '/closed-eye-black.svg'
      : this.env + '/binoculars-fill-black.svg';
  }
}
