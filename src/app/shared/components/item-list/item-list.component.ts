import { Component, OnInit, Input } from '@angular/core';
import { Router } from '@angular/router';
import { environment } from 'src/environments/environment';

export interface ItemList {
  id?: string;
  visible?: boolean;
  title: string;
  eventTitle?: () => void;
  subtitle?: string;
  price?: number | '';
  description?: string;
  description2?: string;
  image?: string;
  eventImage?: () => void;
  icon?: string;
  text_style?: boolean;
  text_left?: string;
  text_middle?: string;
  bonus?: string;
  text_right?: string;
  text_right_function?: () => void,
  full_text?: string;
  icons?: Array<any>;
  text_icon?: string;
  icons_image?: Array<any>;
  icon_bottom?: any;
  icons_right?: Array<any>;
  icons_bottom_right?: Array<any>;
  icons_bottom_right_first?: Array<any>;
  merchant_info?: boolean;
  add_tag?: boolean;
  tag_function?: () => void,
  bar?: boolean;
  barColor?: string;
  barText?: string;
  barLeftIcon?: string;
  barRightIcon?: string;
  icons_image_bool?: boolean;
  bar_icons?: boolean;
  contentBgColor?: string;
  phone?: string;
}

@Component({
  selector: 'app-item-list',
  templateUrl: './item-list.component.html',
  styleUrls: ['./item-list.component.scss'],
})
export class ItemListComponent implements OnInit {
  @Input() itemListContent: ItemList = {
    id: '',
    title: '',
    eventTitle: undefined,
    subtitle: '',
    price: null,
    description: '',
    image: '',
    eventImage: undefined,
    icon: '',
    text_style: true,
    text_left: '',
    text_middle: '',
    bonus: '',
    text_right: '',
    full_text: '',
    icons: [],
    text_icon: '',
    icons_image: [],
    icon_bottom: {},
    icons_right: [],
    icons_bottom_right: [],
    merchant_info: false,
    add_tag: false,
    bar: false,
    barColor: 'transparent',
    barText: '',
    barLeftIcon: '',
    barRightIcon: '',
    contentBgColor: '',
    phone: '',
  };

  @Input('color') color: 'blue' | 'green' = 'blue' ;
  @Input('marginTop') marginTop = '62px';
  @Input('marginBottom') marginBottom = '0px';
  palette: string ;
  textColor: string;
  env: string = environment.assetsUrl;

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.setColor(this.color);
  }

  formatPrice(price: string = '') {
    return `${price}`.replace(',', '.').replace('.', ',');
  }

  redirectTo() {
    this.router.navigate([
      `/ecommerce/leadword-view/${this.itemListContent.title}`,
    ]);
  }
  
  setColor(color){
    switch(color){
        case 'blue':
        this.palette = 'invert(45%) sepia(25%) saturate(1380%) hue-rotate(184deg) brightness(94%) contrast(98%)'
        this.textColor = '#4773D8'

        break;

        case 'green':
        this.palette = 'invert(39%) sepia(50%) saturate(543%) hue-rotate(61deg) brightness(90%) contrast(89%)'
        this.textColor = '#40772F'

        break;
    }
  }
}
