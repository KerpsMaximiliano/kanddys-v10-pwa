import { Component, OnInit, Input, Output } from '@angular/core';
import { EmbeddedComponent } from 'src/app/core/types/multistep-form';
import { SwiperOptions } from 'swiper';
import { BlankComponent } from '../../dialogs/blank/blank.component';

@Component({
  selector: 'app-dialog-flow',
  templateUrl: './dialog-flow.component.html',
  styleUrls: ['./dialog-flow.component.scss'],
})
export class DialogFlowComponent implements OnInit {
  @Input() dialogs: Array<EmbeddedComponent> = [
    {
      component: BlankComponent,
      inputs: {
        containerStyles: {
          height: '500px',
          width: '90%',
        },
      },
    },
    {
      component: BlankComponent,
      inputs: {
        containerStyles: {
          height: '200px',
          width: '90%',
        },
      },
    },
    {
      component: BlankComponent,
      inputs: {
        containerStyles: {
          height: '200px',
          width: '90%',
        },
      },
    },
    {
      component: BlankComponent,
      inputs: {
        containerStyles: {
          height: '200px',
          width: '90%',
        },
      },
    },
  ];
  swiperConfig: SwiperOptions = {
    direction: 'vertical',
    centeredSlides: true,
    slidesPerView: 'auto',
    spaceBetween: 30
  };
  @Input() status: 'OPEN' | 'CLOSE' = 'CLOSE';

  constructor() {}

  ngOnInit(): void {}
}
