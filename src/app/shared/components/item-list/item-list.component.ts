import { Component, OnInit, Input } from '@angular/core';
import { Router } from '@angular/router';

export interface ItemList {
  id?: string;
  title: string;
  eventTitle?: any;
  subtitle?: string;
  price?: number | '';
  description?: string;
  image?: string;
  eventImage?: any;
  icon?: string;
  text_style?: boolean;
  text_left?: string;
  text_right?: string;
  full_text?: string;
  icons?: Array<any>;
  text_icon?: string;
  icons_image?: Array<any>;
  icon_bottom?: any;
  icons_right?: Array<any>;
  icons_bottom_right?: Array<any>;
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
    text_right: '',
    full_text: '',
    icons: [],
    text_icon: '',
    icons_image: [],
    icon_bottom: {},
    icons_right: [],
    icons_bottom_right: [],
    bar: false,
    barColor: 'transparent',
    barText: '',
    barLeftIcon: '',
    barRightIcon: '',
    contentBgColor: '',
    phone: '',
  };

  @Input('marginTop') marginTop = '62px';
  @Input('marginBottom') marginBottom = '0px';

  constructor(private router: Router) {}

  ngOnInit(): void {}

  formatPrice(price: string = '') {
    return `${price}`.replace(',', '.').replace('.', ',');
  }

  redirectTo() {
    this.router.navigate([
      `/ecommerce/leadword-view/${this.itemListContent.title}`,
    ]);
  }
}
