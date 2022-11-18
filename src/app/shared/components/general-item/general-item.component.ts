import { Component, Input, OnInit, Output } from '@angular/core';
import { Item } from 'src/app/core/models/item';
import { Tag } from 'src/app/core/models/tags';
import { environment } from 'src/environments/environment';

type GeneralItemStylesPresets = 'large-card' | 'small-card';

export interface Button {
  text?: string;
  clickEvent(...params): any;
}

type EntitiesAllowed = 'ITEM' | 'ORDER' | 'TAG';

type CSSStyles = Record<string, string | number>;

@Component({
  selector: 'app-general-item',
  templateUrl: './general-item.component.html',
  styleUrls: ['./general-item.component.scss'],
})
export class GeneralItemComponent implements OnInit {
  //General variables
  @Input() entity: EntitiesAllowed = 'ITEM';
  cardMainImage: string = null;

  //item-specific variables
  @Input() item: Item = null;
  @Input() itemMainTitle: string = null;
  @Input() tagsByIdsObject: Record<string, Tag> = null;
  @Input() showIconForItemStatus: boolean = false;
  @Input() showVisitorCounter: boolean = false;
  @Input() statusIcon: string = null;
  @Input() tagsSeparatedByComma: string = null;

  //tag-specific variables
  @Input() tag: Tag = null;
  @Input() showIconForTagStatus: boolean = false;

  //card theming
  @Input() stylePreset: Array<GeneralItemStylesPresets> = null;
  @Input() mainColor: string = '#020202';
  @Input() gradientTopColor: string = 'transparent';
  @Input() shouldIconsHaveBackground: boolean = false;

  //dynamic css classes
  @Input() containerStyles: Record<string, string | number> = {
    backgroundImage:
      "url('https://upload.wikimedia.org/wikipedia/en/c/c6/The_Legend_of_Zelda_Breath_of_the_Wild.jpg')",
  };
  gradientBottomColor: string = this.mainColor;
  @Input() containerGradientBoxStyles: CSSStyles = {};
  @Input() topInnerButtonsContainerStyles: CSSStyles = null;
  @Input() topInnerButtonStyles: CSSStyles = {};
  @Input() itemPresentationBoxStyles: CSSStyles = {};
  @Input() iconsRowsStyles: CSSStyles = null;
  @Input() singleIconStyles: CSSStyles = null;
  @Input() titleStyles: CSSStyles = {};
  @Input() tagsStyles: CSSStyles = {};
  @Input() itemPresentationBoxTopRowStyles: CSSStyles = null;
  @Input() itemPresentationBoxMiddleRowStyles: CSSStyles = null;
  @Input() itemPresentationBoxBottomRowStyles: CSSStyles = null;
  @Input() viewsCounterStyles: CSSStyles = null;
  @Input() textColor: string = '#fff';

  //buttons
  @Input() topRightButton: Button = null;
  @Input() topInnerButtons: Array<Button> = null;

  env: string = environment.assetsUrl;

  constructor() {}

  ngOnInit(): void {
    this.containerGradientBoxStyles.backgroundImage = `linear-gradient(to top, ${this.mainColor}, ${this.gradientTopColor} 60%)`;

    switch (this.entity) {
      case 'ITEM':
        if (['disabled', 'featured'].includes(this.item.status)) {
          this.showIconForItemStatus = true;

          this.statusIcon =
            this.env +
            (this.item.status === 'disabled'
              ? '/closed-eye-black.svg'
              : '/binoculars-fill-black.svg');
        }

        if (this.item.params.length === 0) {
          this.cardMainImage =
            this.item.images.length > 0 ? this.item.images[0] : null;
          this.itemMainTitle = this.item.name ? this.item.name : 'Sin titulo';
        }
        break;
      case 'TAG':
        if (['disabled', 'featured'].includes(this.tag.status)) {
          this.showIconForTagStatus = true;

          this.statusIcon =
            this.env +
            (this.tag.status === 'disabled'
              ? '/closed-eye-black.svg'
              : '/binoculars-fill-black.svg');
        }

        if (this.tag.images.length > 0) this.cardMainImage = this.tag.images[0];

        break;
    }

    if (this.textColor) {
      this.itemPresentationBoxStyles.color = this.textColor;
      this.topInnerButtonStyles.color = this.textColor;
      this.titleStyles.color = this.textColor;
      this.tagsStyles.color = this.textColor;
    }
  }

  cardClicked() {}

  spreadOperator = (
    object: Record<string, any>,
    object2: Record<string, any>
  ) => {
    return { ...object, ...object2 };
  };

  getTagSeparatedByComma(): string {
    if (
      this.entity === 'ITEM' &&
      this.item.tags &&
      this.item.tags.length &&
      this.tagsByIdsObject
    ) {
      let tagNames = [];

      for (const tagId of this.item.tags) {
        tagNames.push(this.tagsByIdsObject[tagId].name);
      }

      this.tagsSeparatedByComma =
        tagNames.length < 7
          ? tagNames.join(',')
          : tagNames.slice(0, 7).join(', ') + ', +' + (tagNames.length - 6);
    }

    return this.tagsSeparatedByComma;
  }
}
