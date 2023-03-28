import {
  Component,
  OnInit,
  Input,
  Output,
  ViewChild,
  EventEmitter,
  AfterViewInit,
} from '@angular/core';
import { EmbeddedComponentWithId } from 'src/app/core/types/multistep-form';
import { SwiperOptions, Swiper } from 'swiper';
import { SwiperComponent } from 'ngx-swiper-wrapper';
import {
  DialogFlowService,
  EmbeddedDialog,
} from 'src/app/core/services/dialog-flow.service';

@Component({
  selector: 'app-dialog-flow',
  templateUrl: './dialog-flow.component.html',
  styleUrls: ['./dialog-flow.component.scss'],
})
export class DialogFlowComponent implements OnInit {
  @Input() dialogFlowId: string = null;
  @Input() dialogs: Array<EmbeddedComponentWithId> = [];
  @Input() allowSlideNext = true;
  @Input() blockClosure = false;
  @Output() saveConfigRef = new EventEmitter();
  @Output() moveToDialogRef = new EventEmitter();
  @Output() closingDialogSignal = new EventEmitter();
  @Output() openingDialogSignal = new EventEmitter();
  swiperConfig: SwiperOptions = {
    direction: 'vertical',
    centeredSlides: true,
    slidesPerView: 'auto',
    spaceBetween: 17,
    watchSlidesProgress: true,
    watchSlidesVisibility: true,
    preventInteractionOnTransition: true,
    allowTouchMove: false
  };
  @Input() status: 'OPEN' | 'CLOSE' = 'CLOSE';
  endedTransition: boolean = true;
  currentDialogIndex: number = 0;

  @ViewChild('dialogSwiper') dialogSwiper: SwiperComponent;

  constructor(private service: DialogFlowService) {}

  ngOnInit(): void {
    if (!this.dialogFlowId) throw Error('Dialog flow has no id');
    else {
      if (!this.service.dialogsFlows[this.dialogFlowId]) {
        this.service.dialogsFlows[this.dialogFlowId] = {};

        this.dialogs.forEach((dialog, index) => {
          if (index === 0) this.service.activeDialogId = dialog.componentId;

          this.service.dialogsFlows[this.dialogFlowId][dialog.componentId] = {
            dialogId: dialog.componentId,
            swiperConfig: this.swiperConfig,
            fields: {},
          };
        });
      }
    }

    this.service.swiperConfig = this.swiperConfig;

    setTimeout(() => {
      this.applyTransparencyToSlidesThatArentActive();
      this.swiperConfig.allowSlideNext = this.allowSlideNext;
      this.saveConfigRef.emit(this.swiperConfig);
      this.moveToDialogRef.emit(this.moveToDialogByIndex.bind(this));

      if (
        this.dialogs[this.currentDialogIndex].inputs &&
        this.dialogs[this.currentDialogIndex].inputs.onActiveSlideCallback
      ) {
        this.dialogs[this.currentDialogIndex].inputs.onActiveSlideCallback();
      }
    }, 100);

    /*
    const overlay = document.getElementById('flow-contents');
    overlay.addEventListener('click',  (event) => {
      if (event.target === overlay) {
        event.stopPropagation();
        this.openOrClose()
      }
    });*/
  }

  applyTransparencyToSlidesThatArentActive() {
    this.dialogs.forEach((dialog, index) => {
      if (!this.dialogs[index].inputs) this.dialogs[index].inputs = {};
      if (!this.dialogs[index].inputs.containerStyles)
        this.dialogs[index].inputs.containerStyles = {};

      if (!this.dialogs[index].inputs) this.dialogs[index].inputs = {};
      if (!this.dialogs[index].inputs.containerStyles)
        this.dialogs[index].inputs.containerStyles = {};

      if (index !== this.currentDialogIndex) {
        //this.dialogs[index].inputs.containerStyles.opacity = '0.5';
      } else {
        this.dialogs[index].inputs.containerStyles.opacity = '1';
        this.service.activeDialogId = dialog.componentId;
      }
    });

    if (
      this.dialogs[this.currentDialogIndex].inputs &&
      this.dialogs[this.currentDialogIndex].inputs.onSlideChangeCallback
    ) {
      this.dialogs[this.currentDialogIndex].inputs.onSlideChangeCallback();
    }
  }

  slideTransitionEnd() {
    this.endedTransition = true;
    this.dialogs.forEach((slide, index) => {
      if (
        'shouldRerender' in this.dialogs[index] &&
        this.dialogs[index].shouldRerender
      ) {
        this.dialogs[index].shouldRerender = this.dialogs[index].shouldRerender;
      }
    });

    if (
      this.dialogs[this.currentDialogIndex].inputs &&
      this.dialogs[this.currentDialogIndex].inputs.onActiveSlideCallback
    ) {
      this.dialogs[this.currentDialogIndex].inputs.onActiveSlideCallback();
    } else {
      this.swiperConfig.allowSlideNext = true;
      this.swiperConfig.allowSlidePrev = true;
    }
  }

  tapEvent(tappedDialogIndex: number) {
    if (
      this.endedTransition &&
      (tappedDialogIndex === this.currentDialogIndex + 1 ||
        tappedDialogIndex === this.currentDialogIndex - 1)
    ) {
      this.endedTransition = false;
      this.dialogSwiper.directiveRef.setIndex(tappedDialogIndex);

      if (!this.swiperConfig.allowSlideNext) {
        this.endedTransition = true;
      }
    }
  }

  changeActiveDialog(eventData: Swiper) {
    this.currentDialogIndex = eventData.activeIndex;

    this.applyTransparencyToSlidesThatArentActive();
  }

  moveToDialogByIndex(dialogNumber: number) {
    setTimeout(() => {
      this.dialogSwiper.directiveRef.setIndex(dialogNumber);
    }, 100);
  }

  openOrClose(eventData: any) {
    const triggerElement = eventData.target as HTMLElement;

    if (
      triggerElement.classList.contains('swiper') || triggerElement.classList.contains('swiper-wrapper')
    ) {
      if (this.status === 'OPEN') {
        this.status = 'CLOSE';
        this.closingDialogSignal.emit(true);
      } else {
        this.status = 'OPEN';
      }
    }
  }

  onDragging(eventData: [Swiper, PointerEvent]) {
    //const currentDialog = this.service.dialogsFlows[this.dialogFlowId][this.dialogs[this.currentDialogIndex].componentId];
    
    if (
      this.dialogs[this.currentDialogIndex].inputs &&
      this.dialogs[this.currentDialogIndex].inputs.onDragging
    ) {
      const swiper = eventData[0] as any;
      const distanceLeft =
        swiper.snapGrid[swiper.activeIndex + 1] - swiper.translate;

      if (distanceLeft >= 0) {
        this.dialogs[this.currentDialogIndex].inputs.onDragging();
      }
    }
  }
}
