import { Component, OnInit } from '@angular/core';

export interface ItemList {
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
}


@Component({
  selector: 'app-my-items',
  templateUrl: './my-items.component.html',
  styleUrls: ['./my-items.component.scss']
})


export class MyItemsComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }
  

  itemInfo:ItemList = 
  {
    title: 'aaaa',
    subtitle: 'aaaaaaaa',
    barRightIcon: 'https://i.picsum.photos/id/19/200/300.jpg?hmac=znGSIxHtiP0JiLTKW6bT7HlcfagMutcHfeZyNkglQFM',
    icons_image_bool: true,
  }

}
