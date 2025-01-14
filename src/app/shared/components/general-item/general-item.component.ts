import {
  Component,
  Input,
  OnInit,
  Output,
  EventEmitter,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import { Item } from 'src/app/core/models/item';
import { PostInput } from 'src/app/core/models/post';
import { Tag } from 'src/app/core/models/tags';
import { environment } from 'src/environments/environment';

type GeneralItemStylesPresets = 'large-card' | 'small-card';

export interface Button {
  text?: string;
  clickEvent(...params): any;
}

type EntitiesAllowed = 'ITEM' | 'ORDER' | 'TAG' | 'POST-SLIDE';

type CSSStyles = Record<string, string | number>;

@Component({
  selector: 'app-general-item',
  templateUrl: './general-item.component.html',
  styleUrls: ['./general-item.component.scss'],
})
export class GeneralItemComponent implements OnInit {
  //General variables
  @Input() entity: EntitiesAllowed = 'ITEM';
  @Input() shouldItemBeSelectectable: boolean = false;
  @Input() itemSelected: boolean = false;
  @Input() useFlatBackgroundForCardInfo: boolean = false;
  @Output() itemSelectedEvent = new EventEmitter();
  cardMainImage: string = null;
  imageFiles: string[] = ['image/png', 'image/jpg', 'image/jpeg'];
  videoFiles: string[] = [
    'video/mp4',
    'video/webm',
    'video/m4v',
    'video/avi',
    'video/mpg',
    'video/mpeg',
    'video/mpeg4',
    'video/mov',
    'video/3gp',
    'video/mxf',
    'video/m2ts',
    'video/m2ts',
  ];
  isMainImageAVideo: boolean = false;

  //item-specific variables
  @Input() item: Item = null;
  @Input() itemMainTitle: string = null;
  @Input() tagsByIdsObject: Record<string, Tag> = null;
  @Input() showIconForItemStatus: boolean = false;
  @Input() showVisitorCounter: boolean = false;
  @Input() showPrice: boolean = false;
  @Input() hideCardTitle: boolean = false;
  @Input() priceLabel: string = null;
  @Input() statusIcon: string = null;
  @Input() statusIconLabel: string = null;
  @Input() statusIconLabelSide: 'LEFT' | 'RIGHT' = 'RIGHT';
  @Input() tagsSeparatedByComma: string = null;

  //tag-specific variables
  @Input() tag: Tag = null;
  @Input() showIconForTagStatus: boolean = false;

  //Post-slides specific variables
  @Input() slides: PostInput = null;

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
  @Input() topInnerButtonsContainerStyles: CSSStyles = null;
  @Input() topInnerButtonStyles: CSSStyles = {};
  @Input() itemPresentationBoxStyles: CSSStyles = {};
  @Input() iconsRowsStyles: CSSStyles = null;
  @Input() singleIconStyles: CSSStyles = null;
  @Input() selectionButtonStyles: CSSStyles = {};
  @Input() selectionButtonIconStyles: CSSStyles = {};
  @Input() titleStyles: CSSStyles = {};
  @Input() tagsStyles: CSSStyles = {};
  @Input() itemPresentationBoxTopRowStyles: CSSStyles = null;
  @Input() itemPresentationBoxMiddleRowStyles: CSSStyles = null;
  @Input() itemPresentationBoxBottomRowStyles: CSSStyles = null;
  @Input() statusIconLabelStyles: CSSStyles = null;
  @Input() viewsCounterStyles: CSSStyles = null;
  @Input() innerWrapperStyles: CSSStyles = null;
  @Input() textColor: string = '#fff';
  @Input() removeBackgroundImage: boolean = false;

  //buttons
  @Input() topRightButton: Button = null;
  @Input() topInnerButtons: Array<Button> = null;
  @Input() showEntityButton: boolean = true;
  @Input() overwriteInnerButtonColor: boolean = true;

  env: string = environment.assetsUrl;

  constructor() {}

  ngOnInit(): void {
    switch (this.entity) {
      case 'ITEM':
        if (['disabled', 'featured'].includes(this.item?.status)) {
          this.showIconForItemStatus = true;

          this.statusIcon =
            this.env +
            (this.item.status === 'disabled'
              ? '/closed-eye-black.svg'
              : '/binoculars-fill-black.svg');
        }

        if (this.item?.params?.length === 0) {
          this.cardMainImage =
            this.item.images.length > 0 ? this.item.images[0].value : null;

          if (
            this.cardMainImage &&
            !this.cardMainImage.includes('http') &&
            !this.cardMainImage.includes('https')
          ) {
            this.cardMainImage = 'https://' + this.cardMainImage;
          }

          const fileParts = this.cardMainImage.split('.');
          const fileExtension = fileParts[fileParts.length - 1].toLowerCase();
          let auxiliarImageFileExtension = 'image/' + fileExtension;
          let auxiliarVideoFileExtension = 'video/' + fileExtension;

          if (this.imageFiles.includes(auxiliarImageFileExtension)) {
            this.isMainImageAVideo = false;
          } else if (this.videoFiles.includes(auxiliarVideoFileExtension)) {
            this.isMainImageAVideo = true;
          }

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

        if (this.tag.entity && !this.topInnerButtons) {
          let text = null;

          if (this.showEntityButton) {
            switch (this.tag.entity) {
              case 'order':
                text = 'Facturas';
                break;
              case 'item':
                text = 'Articulos';
                break;
            }
            this.topInnerButtons = [];
            this.topInnerButtons.push({
              text,
              clickEvent: () => null,
            });
          }
        }

        if (this.tag.images && this.tag.images.length > 0)
          this.cardMainImage = this.tag.images[0];

        break;
      case 'POST-SLIDE':
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

  selectItem() {
    this.itemSelected = !this.itemSelected;
    this.itemSelectedEvent.emit(this.itemSelected);
  }

  triggerTopRightButtonClick() {
    const params = [];

    if (this.entity === 'ITEM') params.push(this.item);
    else if (this.entity === 'TAG') params.push(this.tag);

    this.topRightButton.clickEvent(...params);
  }
}
