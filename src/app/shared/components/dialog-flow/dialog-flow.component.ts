import {
  Component,
  OnInit,
  Input,
  Output,
  ViewChild,
  EventEmitter,
} from '@angular/core';
import { EmbeddedComponentWithId } from 'src/app/core/types/multistep-form';
import { SwiperOptions, Swiper } from 'swiper';
import { SwiperComponent } from 'ngx-swiper-wrapper';
import { BlankComponent } from '../../dialogs/blank/blank.component';
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
  @Output() saveConfigRef = new EventEmitter();
  @Output() moveToDialogRef = new EventEmitter();
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

  constructor(private service: DialogFlowService) {}

  ngOnInit(): void {
    if (!this.dialogFlowId) throw Error('Dialog flow has no id');
    else {
      if (!this.service.dialogsFlows[this.dialogFlowId]) {
        this.service.dialogsFlows[this.dialogFlowId] = {};

        this.dialogs.forEach((dialog) => {
          this.service.dialogsFlows[this.dialogFlowId][dialog.componentId] = {
            dialogId: dialog.componentId,
            swiperConfig: JSON.parse(JSON.stringify(this.swiperConfig)),
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
    }, 100);
  }

  applyTransparencyToSlidesThatArentActive() {
    this.dialogs.forEach((slide, index) => {
      const dialogHTMLElement = slide;

      if (!this.dialogs[index].inputs) this.dialogs[index].inputs = {};
      if (!this.dialogs[index].inputs.containerStyles)
        this.dialogs[index].inputs.containerStyles = {};

      if (index !== this.currentDialogIndex) {
        this.dialogs[index].inputs.containerStyles.opacity = '0.5';
      } else {
        this.dialogs[index].inputs.containerStyles.opacity = '1';
      }

      this.dialogs[index].shouldRerender = true;
    });

    setTimeout(() => {
      this.dialogs.forEach((slide, index) => {
        this.dialogs[index].shouldRerender = false;
      });
    }, 100);
  }

  tapEvent(tappedDialogIndex: number) {
    this.dialogSwiper.directiveRef.setIndex(tappedDialogIndex);
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
}
