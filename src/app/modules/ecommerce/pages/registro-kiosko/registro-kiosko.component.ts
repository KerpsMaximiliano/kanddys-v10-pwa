import { Component, OnInit } from '@angular/core';
import Swiper, { SwiperOptions } from 'swiper';

@Component({
  selector: 'app-registro-kiosko',
  templateUrl: './registro-kiosko.component.html',
  styleUrls: ['./registro-kiosko.component.scss'],
})
export class RegistroKioskoComponent implements OnInit {
  kioskoName: string;
  description: string;

  constructor() {}

  ngOnInit(): void {}

  swiperConfig: SwiperOptions = {
    slidesPerView: 1,
    resistance: false,
    freeMode: false,
    spaceBetween: 0,
    autoplay: {
      delay: 10000,
      stopOnLastSlide: true,
      disableOnInteraction: false,
    },
  };

  async onNameInput(event: Event | string, input: HTMLInputElement) {
    this.kioskoName = input.value;
    //console.log(this.kioskoName);
  }
}
