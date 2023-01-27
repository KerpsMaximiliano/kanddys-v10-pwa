import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Swiper, SwiperOptions } from 'swiper';

@Component({
  selector: 'app-options-bar',
  templateUrl: './options-bar.component.html',
  styleUrls: ['./options-bar.component.scss'],
})
export class OptionsBarComponent implements OnInit {
  @Input() options: Array<string> = [];
  @Input() type: string = '1';
  @Input() optCol: number = 0;
  @Input() swiperMode: boolean = false;
  @Output() selectedIndex = new EventEmitter<number>();

  selected: number = 0;

  swiperConfig: SwiperOptions = {
    slidesPerView: 'auto',
    freeMode: true,
    spaceBetween: 8,
  };

  constructor() {}

  ngOnInit(): void {}

  selectOpt(index: number) {
    if (index != this.selected) {
      this.selected = index;
    }
    this.selectedIndex.emit(this.selected);
  }
}
