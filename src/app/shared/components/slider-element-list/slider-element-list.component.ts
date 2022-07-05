import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { environment } from 'src/environments/environment';
import { Tag } from '../../../core/models/tags';
import { SwiperOptions } from 'swiper';

export interface Content{
    name: string;
    image?: string;
    icon?: {
        src: string;
        alt?: string;
    };
    func?: () => void;
}

export interface DataSlider{
    image: string;
    tag: Tag;
}

@Component({
  selector: 'app-slider-element-list',
  templateUrl: './slider-element-list.component.html',
  styleUrls: ['./slider-element-list.component.scss']
})
export class SliderElementListComponent implements OnInit {

    @Input() headline: string;
    @Input() topButton: {
        text: string;
        color: string;
    };
    @Input() content: Content[];
    @Input() data: DataSlider[];
    
    @Output() topOut = new EventEmitter();
    public swiperConfig: SwiperOptions = {
        slidesPerView: 'auto',
        freeMode: true,
        spaceBetween: 20
      };
    env: string = environment.assetsUrl;
  constructor() { }

  ngOnInit(): void {
  }

}
