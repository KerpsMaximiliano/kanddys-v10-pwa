import {
  Component,
  OnInit,
  Input,
  Output,
  EventEmitter,
  ViewChild,
} from '@angular/core';
import { environment } from 'src/environments/environment';
import { Swiper, SwiperOptions } from 'swiper';
import { MatMenuModule } from '@angular/material/menu';

@Component({
  selector: 'app-options-bar',
  templateUrl: './options-bar.component.html',
  styleUrls: ['./options-bar.component.scss'],
})
export class OptionsBarComponent implements OnInit {
  environment: string = environment.assetsUrl;
  @Input() options: Array<any> = [];
  @Input() type: '1' | '2' | '3' = '1';
  @Input() optCol: number = 0;
  @Input() swiperMode: boolean = false;
  @Input() openMenu: boolean;
  @Output() selectedIndex = new EventEmitter<number>();
  @Output() selectedMenuIndex = new EventEmitter<{
    index: number;
    menuIndex: number;
  }>();

  selected: number = 0;

  swiperConfig: SwiperOptions = {
    slidesPerView: 'auto',
    freeMode: true,
    spaceBetween: 8,
  };

  menuOptions = [
    {
      text: 'Nuevo artículo',
      icon: 'chevron_right',
    },
    {
      text: 'Orden de artículos',
      icon: 'chevron_right',
    },
    {
      text: 'Estilo de cartas',
      icon: 'chevron_right',
    },
    {
      text: 'Pantalla Inicial',
      icon: 'check',
    },
  ];

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
