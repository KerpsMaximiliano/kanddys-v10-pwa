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
  imageSize?: 'small' | 'normal';
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
  bar?: boolean;
  barColor?: string;
  barText?: string;
  barLeftIcon?: string;
  barRightIcon?: string;
  icons_image_bool?: boolean;
  bar_icons?: boolean;
  contentBgColor?: string;
  phone?: string;
  status?: 'verificado' | 'en revisión' | 'por confirmar' | 'completado';
  statusCallback?: () => void,
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
    imageSize: 'normal',
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

  @Input('marginTop') marginTop = '62px';
  @Input('marginBottom') marginBottom = '0px';
  env: string = environment.assetsUrl;

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
