import { Component, OnInit } from '@angular/core';
import { SwiperOptions } from 'swiper';

@Component({
  selector: 'app-invisible-marketing-landing',
  templateUrl: './invisible-marketing-landing.component.html',
  styleUrls: ['./invisible-marketing-landing.component.scss']
})
export class InvisibleMarketingLandingComponent implements OnInit {

  swiperConfig: SwiperOptions = {
    slidesPerView: 2,
    spaceBetween: 2,
  }

  constructor() { }

  ngOnInit(): void {
  }

  goToWhatsapp() {
    window.open('https://api.whatsapp.com/send?phone=19188156444', '_blank');
  }
}
