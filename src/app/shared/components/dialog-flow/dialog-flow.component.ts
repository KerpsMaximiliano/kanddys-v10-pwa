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
  @Input() allowSlideNext = true;
  currentDialogIndex: number = 0;

  @ViewChild('dialogSwiper') dialogSwiper: SwiperComponent;

  constructor() {}

  ngOnInit(): void {
    setTimeout(() => {
      this.applyTransparencyToSlidesThatArentActive();
      this.swiperConfig.allowSlideNext = this.allowSlideNext;
      this.saveConfigRef.emit(this.swiperConfig);
    }, 100);
  }

  applyTransparencyToSlidesThatArentActive() {
    this.dialogs.forEach((slide, index) => {
      if (index !== this.currentDialogIndex) {
        this.dialogs[index].inputs.containerStyles.opacity = '0.5';
      } else {
        this.dialogs[index].inputs.containerStyles.opacity = '1';
      }

      this.dialogs[index].shouldRerender = false;
    });

    setTimeout(() => {
      this.dialogs.forEach((slide, index) => {
        this.dialogs[index].shouldRerender = false;
      });
    }, 100);
  }

  tapEvent(tappedDialogIndex: number) {
    if (tappedDialogIndex !== this.currentDialogIndex) {
      this.dialogSwiper.directiveRef.setIndex(tappedDialogIndex);
    }
  }

  changeActiveDialog(eventData: Swiper) {
    this.currentDialogIndex = eventData.activeIndex;

    this.applyTransparencyToSlidesThatArentActive();
  }
}
