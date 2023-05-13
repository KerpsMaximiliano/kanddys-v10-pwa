import { Location } from '@angular/common';
import { Component, OnInit, Input, Output, ViewChild } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { SwiperComponent } from 'ngx-swiper-wrapper';
import { DialogFlowService } from 'src/app/core/services/dialog-flow.service';
import { MerchantsService } from 'src/app/core/services/merchants.service';
import { SaleFlowService } from 'src/app/core/services/saleflow.service';
import {
  ResponsesByQuestion,
  WebformsService,
} from 'src/app/core/services/webforms.service';
import { OptionAnswerSelector } from 'src/app/core/types/answer-selector';
import { ExtendedAnswerDefault } from 'src/app/shared/components/webform-multiple-selection-question/webform-multiple-selection-question.component';
import { environment } from 'src/environments/environment';
import { SwiperOptions } from 'swiper';

@Component({
  selector: 'app-webform-options-selector',
  templateUrl: './webform-options-selector.component.html',
  styleUrls: ['./webform-options-selector.component.scss'],
})
export class WebformOptionsSelectorComponent implements OnInit {
  swiperConfig: SwiperOptions = {
    slidesPerView: 1,
    resistance: false,
    freeMode: false,
    spaceBetween: 0,
  };
  currentMediaSlide: number = 0;
  @Input() completeAnswers: Array<{
    text: string;
    fileInput: string;
    selected: boolean;
  }> = []; //Array of images by options
  @Input() gridImageIndexesInCompleteAnswers: Record<number, number> = {}; //Array of images by options
  @Input() answerSelectorIndexesInCompleteAnswers: Record<number, number> = {}; //Array of images by options
  @Input() multiple: boolean = false; //Array of images by options
  @Input() required: boolean = false; //Array of images by options
  @Input() selected: number = null;
  @Input() selectedImage: number = null;
  @Input() selectedImagesIndexes: Array<number> = [];
  @Input() selectedIndexes: Array<number> = [];
  env: string = environment.assetsUrl;

  optionsByImages: Record<number, number> = {}; //index of option, index of image
  imagesByOption: Record<number, number> = {}; //index of image, index of option

  @ViewChild('mediaSwiper') mediaSwiper: SwiperComponent;

  constructor(
    public dialogFlowService: DialogFlowService,
    private webformsService: WebformsService,
    private location: Location,
    private merchantsService: MerchantsService,
    private saleflowService: SaleFlowService,
    private router: Router,
    private route: ActivatedRoute,
    private snackbar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(({ startAt }) => {
      if (this.webformsService.selectedQuestion === null) {
        this.router.navigate([
          '/ecommerce/' + this.merchantsService.merchantData.slug + '/checkout',
        ]);
      }

      if (
        !this.webformsService.clientResponsesByItem[
          this.webformsService.selectedQuestion.questionId
        ]
      )
        this.router.navigate([
          '/ecommerce/' + this.merchantsService.merchantData.slug + '/checkout',
        ]);

      this.completeAnswers =
        this.webformsService.clientResponsesByItem[
          this.webformsService.selectedQuestion.questionId
        ].allOptions;
      this.multiple = this.webformsService.selectedQuestion?.multiple;
      this.required = this.webformsService.selectedQuestion?.required;

      setTimeout(() => {
        if (startAt !== null || startAt !== undefined)
          this.mediaSwiper.directiveRef.setIndex(startAt);
      }, 100);
    });
  }

  updateCurrentSlideData(event: any) {
    this.currentMediaSlide = this.mediaSwiper.directiveRef.getIndex();
  }

  selectOpt(index: number, imageRoute?: string) {
    //this.selected = this.imagesByOption[index];
    this.selectedImage = index;

    for (let i = 0; i < this.completeAnswers.length; i++) {
      if (i == index) {
        this.completeAnswers[i].selected = !this.completeAnswers[i].selected;
      } else {
        this.completeAnswers[i].selected = false;
      }
    }

    this.webformsService.clientResponsesByItem[
      this.webformsService.selectedQuestion.questionId
    ].allOptions = this.completeAnswers;

    if (this.completeAnswers[index].selected) {
      this.webformsService.clientResponsesByItem[
        this.webformsService.selectedQuestion.questionId
      ].response = this.completeAnswers[index].fileInput;

      this.webformsService.clientResponsesByItem[
        this.webformsService.selectedQuestion.questionId
      ].valid = !this.webformsService.selectedQuestion.required
        ? true
        : this.webformsService.selectedQuestion.required &&
          this.completeAnswers[index].fileInput?.length > 0 &&
          this.completeAnswers[index].selected;
    } else {
      this.webformsService.clientResponsesByItem[
        this.webformsService.selectedQuestion.questionId
      ].response = null;

      this.webformsService.clientResponsesByItem[
        this.webformsService.selectedQuestion.questionId
      ].valid = !this.webformsService.selectedQuestion.required
        ? true
        : this.webformsService.selectedQuestion.required &&
          this.completeAnswers[index].fileInput?.length > 0 &&
          this.completeAnswers[index].selected;
    }
  }

  back() {
    this.location.back();
  }

  selectOptMultipleFromGrid(indexClicked: number) {
    const alreadySelectedOptionsIndexes: Array<number> = this.completeAnswers
      .map((option, index) => {
        return option.selected ? index : null;
      })
      .filter((index) => index !== null);

    if (
      this.multiple &&
      alreadySelectedOptionsIndexes.length >=
        this.webformsService.clientResponsesByItem[
          this.webformsService.selectedQuestion.questionId
        ].question.answerLimit &&
      !alreadySelectedOptionsIndexes.includes(indexClicked)
    ) {
      this.snackbar.open(
        'Recuerda que solo puedes seleccionar máximo ' +
          this.webformsService.clientResponsesByItem[
            this.webformsService.selectedQuestion.questionId
          ].question.answerLimit +
          ' opciones',
        'Cerrar',
        {
          duration: 3000,
        }
      );
      return;
    }

    if (this.selectedImagesIndexes.includes(indexClicked)) {
      this.selectedImagesIndexes = this.selectedImagesIndexes.filter(
        (index) => index !== indexClicked
      );
    } else {
      this.selectedImagesIndexes.push(indexClicked);
    }

    for (let i = 0; i < this.completeAnswers.length; i++) {
      if (i === indexClicked)
        this.completeAnswers[i].selected = !this.completeAnswers[i].selected;
    }

    this.webformsService.clientResponsesByItem[
      this.webformsService.selectedQuestion.questionId
    ].allOptions = this.completeAnswers;

    const selectedOptions = this.completeAnswers.filter(
      (answer) => answer.selected
    );

    if (selectedOptions.length) {
      this.webformsService.clientResponsesByItem[
        this.webformsService.selectedQuestion.questionId
      ].multipleResponses = [];

      for (const optionSelected of selectedOptions) {
        const isTheAnswerProvidedByUser = false;

        this.webformsService.clientResponsesByItem[
          this.webformsService.selectedQuestion.questionId
        ].multipleResponses.push({
          response: optionSelected.fileInput || optionSelected.text,
          isProvidedByUser: isTheAnswerProvidedByUser,
          isMedia:
            optionSelected.fileInput &&
            optionSelected.fileInput.includes('https'),
        });

        this.webformsService.clientResponsesByItem[
          this.webformsService.selectedQuestion.questionId
        ].valid = !this.webformsService.selectedQuestion.required
          ? true
          : this.webformsService.selectedQuestion.required &&
            this.webformsService.clientResponsesByItem[
              this.webformsService.selectedQuestion.questionId
            ].multipleResponses?.length > 0;
      }
    } else {
      this.webformsService.clientResponsesByItem[
        this.webformsService.selectedQuestion.questionId
      ].multipleResponses = [];

      this.webformsService.clientResponsesByItem[
        this.webformsService.selectedQuestion.questionId
      ].valid = !this.webformsService.selectedQuestion.required ? true : false;
    }
  }

  emitMultipleSelectedOptions() {}
}
