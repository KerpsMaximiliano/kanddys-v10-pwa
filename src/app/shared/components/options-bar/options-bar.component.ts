import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { environment } from 'src/environments/environment';
import { Swiper, SwiperOptions } from 'swiper';

@Component({
  selector: 'app-options-bar',
  templateUrl: './options-bar.component.html',
  styleUrls: ['./options-bar.component.scss'],
})
export class OptionsBarComponent implements OnInit {

  environment: string = environment.assetsUrl;
  @Input() options: Array<string> = [];
  @Input() type: string = '1';
  @Input() optCol: number = 0;
  @Input() swiperMode: boolean = false;
  @Output() selectedIndex = new EventEmitter<number>();
  @Output() selectedMenuIndex = new EventEmitter<number>();

  selected: number = 0;
  menuSelected: number = 0;

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
    if (index != this.selected) {
      this.selected = index;
    }
    this.selectedIndex.emit(this.selected);
    console.log(this.selected);
  }

  menuOptionSelected(index: number) {
    this.menuSelected = index;
    this.selectedMenuIndex.emit(this.menuSelected);
    console.log(this.menuSelected);
  }
}
