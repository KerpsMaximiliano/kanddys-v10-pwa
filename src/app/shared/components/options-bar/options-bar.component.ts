import {
  Component,
  OnInit,
  Input,
  Output,
  EventEmitter,
  // ViewChild,
} from '@angular/core';
import { environment } from 'src/environments/environment';
// import { Swiper, SwiperOptions } from 'swiper';
// import { MatMenuModule } from '@angular/material/menu';

export interface BarMenu {
  title: string;
  icon: string;
  callback: () => void;
}

export interface BarOptions {
  title: string;
  menu?: BarMenu[];
}

export interface MenuEvent {
  index: number;
  menuIndex: number;
}

@Component({
  selector: 'app-options-bar',
  templateUrl: './options-bar.component.html',
  styleUrls: ['./options-bar.component.scss'],
})
export class OptionsBarComponent implements OnInit {
  environment: string = environment.assetsUrl;
  @Input() options: Array<BarOptions> = [];
  @Input() type: '1' | '2' | '3' = '1';
  @Input() optCol: number = 0;
  // @Input() swiperMode: boolean = false;
  @Output() selectedIndex = new EventEmitter<number>();
  @Output() selectedMenuIndex = new EventEmitter<MenuEvent>();

  selected: number = 0;

  // swiperConfig: SwiperOptions = {
  //   slidesPerView: 'auto',
  //   freeMode: true,
  //   spaceBetween: 8,
  // };

  constructor() {}

  ngOnInit(): void {}

  selectOpt(index: number) {
    this.selected = index;
    this.selectedIndex.emit(this.selected);
  }

  menuOptionSelected(index: number) {
    this.selectedMenuIndex.emit({
      index: this.selected,
      menuIndex: index,
    });
  }
}
