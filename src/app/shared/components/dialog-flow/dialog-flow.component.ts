import {
  Component,
  OnInit,
  Input,
  Output,
  ViewChild,
  EventEmitter,
} from '@angular/core';
import { EmbeddedComponent } from 'src/app/core/types/multistep-form';
import { SwiperOptions, Swiper } from 'swiper';
import { SwiperComponent } from 'ngx-swiper-wrapper';
import { BlankComponent } from '../../dialogs/blank/blank.component';

@Component({
  selector: 'app-dialog-flow',
  templateUrl: './dialog-flow.component.html',
  styleUrls: ['./dialog-flow.component.scss'],
})
export class DialogFlowComponent implements OnInit {
  @Input() dialogs: Array<EmbeddedComponent> = [];
  @Output() saveConfigRef = new EventEmitter();
  swiperConfig: SwiperOptions = {
    direction: 'vertical',
    centeredSlides: true,
    slidesPerView: 'auto',
    spaceBetween: 17,
    watchSlidesProgress: true,
    watchSlidesVisibility: true,
  };
  @Input() status: 'OPEN' | 'CLOSE' = 'CLOSE';
  currentDialogIndex: number = 0;

  @ViewChild('dialogSwiper') dialogSwiper: SwiperComponent;

  constructor() {}

  ngOnInit(): void {
    setTimeout(() => {
      this.applyTransparencyToSlidesThatArentActive();
      // this.swiperConfig.allowSlideNext = false;
      this.saveConfigRef.emit(this.swiperConfig);
    }, 100);
  }

  applyTransparencyToSlidesThatArentActive() {
    const allSlides = document.querySelectorAll('.swiper-slide');

    allSlides.forEach((slide, index) => {
      const dialogHTMLElement = slide;

      if (index !== this.currentDialogIndex) {
        this.dialogs[index].inputs.containerStyles.opacity = '0.5';
      } else {
        this.dialogs[index].inputs.containerStyles.opacity = '1';
      }

      this.dialogs[index].shouldRerender = true;
    });

    setTimeout(() => {
      allSlides.forEach((slide, index) => {
        this.dialogs[index].shouldRerender = false;
      });
    }, 100);
  }

  changeActiveDialog(eventData: Swiper) {
    this.currentDialogIndex = eventData.activeIndex;

    this.applyTransparencyToSlidesThatArentActive();
  }
}
