import { Location } from '@angular/common';
import { Component, OnInit, Input, Output, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SwiperComponent } from 'ngx-swiper-wrapper';
import { DialogFlowService } from 'src/app/core/services/dialog-flow.service';
import { MerchantsService } from 'src/app/core/services/merchants.service';
import { SaleFlowService } from 'src/app/core/services/saleflow.service';
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
  @Input() completeAnswers: Array<ExtendedAnswerDefault> = []; //Array of images by options
  @Input() optionsInImageGrid: Array<ExtendedAnswerDefault> = []; //Array of images by options
  @Input() optionsInAnswerSelector: Array<OptionAnswerSelector> = []; //Array of answer selector options
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
    private location: Location,
    private merchantsService: MerchantsService,
    private saleflowService: SaleFlowService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(({ startAt }) => {
      if (this.dialogFlowService.selectedQuestion === null) {
        this.router.navigate([
          '/ecommerce/' + this.merchantsService.merchantData.slug + '/checkout',
        ]);
      }

      this.completeAnswers =
        this.dialogFlowService.dialogsFlows[
          this.dialogFlowService.selectedQuestion?.flowId
        ][this.dialogFlowService.selectedQuestion?.dialogId].fields['options'];
      this.multiple = this.dialogFlowService.selectedQuestion?.multiple;
      this.required = this.dialogFlowService.selectedQuestion?.required;

      this.initProcesses();

      //Fills optionsByImages
      this.optionsInImageGrid.forEach((optionInImageGrid, index) => {
        this.optionsInAnswerSelector.forEach(
          (optionInAnswerSelector, index2) => {
            if (optionInImageGrid.label === optionInAnswerSelector.value) {
              this.optionsByImages[index] = index2;
              this.imagesByOption[index2] = index;
            }
          }
        );
      });

      setTimeout(() => {
        if (startAt !== null || startAt !== undefined) this.mediaSwiper.directiveRef.setIndex(startAt);
      }, 100);
    });
  }

  initProcesses() {
    if (!this.multiple) {
      this.fillInitialValuesForSingleResponse();
    } else {
      this.fillInitialValuesForMultipleResponse();
    }
  }

  fillInitialValuesForMultipleResponse() {
    this.fillInitialValuesForLists();

    this.setSelectedIndexesFromLists();
  }

  setSelectedIndexesFromLists() {
    const selectedImageIndexes = [];
    const selectedOptionIndexes = [];

    this.optionsInImageGrid.forEach((option, index) => {
      if (option.selected) {
        selectedImageIndexes.push(index);
      }
    });

    this.optionsInAnswerSelector.forEach((option, index) => {
      if (option.selected) {
        selectedOptionIndexes.push(index);
      }
    });

    this.selectedImagesIndexes = selectedImageIndexes;
    this.selectedIndexes = selectedOptionIndexes;
  }

  back() {
    this.location.back();
  }

  updateCurrentSlideData(event: any) {
    this.currentMediaSlide = this.mediaSwiper.directiveRef.getIndex();
  }

  fillInitialValuesForLists() {
    let imagesInGrid = 0;
    this.optionsInImageGrid = this.completeAnswers.filter(
      (optionInList, index) => {
        if (optionInList.isMedia) {
          this.gridImageIndexesInCompleteAnswers[imagesInGrid] = index;
          imagesInGrid++;
        }

        return optionInList.isMedia;
      }
    );

    let optionsInAnswerSelector = 0;
    this.optionsInAnswerSelector = this.completeAnswers
      .filter((option, index) => {
        if (
          (option.isMedia && option.label) ||
          (!option.isMedia && option.value)
        ) {
          this.answerSelectorIndexesInCompleteAnswers[optionsInAnswerSelector] =
            index;
          optionsInAnswerSelector++;
        }

        if (option.isMedia && option.label) return true;
        else if (!option.isMedia && option.value) return true;

        return false;
      })
      .map((option) => ({
        value: option.isMedia && option.label ? option.label : option.value,
        click: true,
        status: true,
        selected: option.selected,
      }));
  }

  fillInitialValuesForSingleResponse() {
    //console.log('ANTES', this.completeAnswers, this.startWithDialogFlow);

    this.fillInitialValuesForLists();

    if (!this.multiple) {
      const selectedIndex = this.completeAnswers.findIndex(
        (option) => option.selected
      );

      if (selectedIndex >= 0) {
        const selectedOptionInAnswerSelector =
          this.optionsInAnswerSelector.findIndex(
            (option, index) =>
              this.answerSelectorIndexesInCompleteAnswers[index] ===
              selectedIndex
          );

        const selectedOptionInGrid = this.optionsInImageGrid.findIndex(
          (option, index) =>
            this.gridImageIndexesInCompleteAnswers[index] === selectedIndex
        );

        this.selected =
          selectedOptionInAnswerSelector >= 0
            ? selectedOptionInAnswerSelector
            : null;
        this.selectedImage =
          selectedOptionInGrid >= 0 ? selectedOptionInGrid : null;
      }
    }
  }

  selectOpt(index: number, imageRoute?: string) {
    //this.selected = this.imagesByOption[index];
    this.selectedImage = index;

    const selectedOptions = JSON.parse(
      JSON.stringify(this.completeAnswers)
    ).map((option, currentIndex) => {
      if (
        this.gridImageIndexesInCompleteAnswers[this.selectedImage] ===
          currentIndex &&
        !option.selected
      ) {
        option.selected = true;
      } else {
        option.selected = false;
      }

      return option;
    });

    this.dialogFlowService.dialogsFlows[
      this.dialogFlowService.selectedQuestion?.flowId
    ][this.dialogFlowService.selectedQuestion?.dialogId].fields.options =
      selectedOptions;

    const justSelectedOptions = selectedOptions.filter(
      (option) => option.selected
    );

    this.completeAnswers = selectedOptions;

    if (this.required) {
      this.dialogFlowService.dialogsFlows[
        this.dialogFlowService.selectedQuestion?.flowId
      ][this.dialogFlowService.selectedQuestion?.dialogId].fields.valid =
        justSelectedOptions.length > 0;
    }

    this.fillInitialValuesForLists();
  }

  selectOptMultipleFromGrid(indexClicked: number) {
    if (this.selectedImagesIndexes.includes(indexClicked)) {
      // remove index from grid array
      const positionInGrid = this.selectedImagesIndexes.findIndex(
        (index) => indexClicked === index
      );
      if (positionInGrid >= 0) {
        this.selectedImagesIndexes.splice(positionInGrid, 1);
      }

      // remove index from list array
      const positionInList = this.optionsByImages[indexClicked];
      if (
        positionInList !== undefined &&
        this.selectedIndexes.includes(positionInList)
      ) {
        this.selectedIndexes.splice(
          this.selectedIndexes.indexOf(positionInList),
          1
        );
      }
    } else {
      // add index to grid array
      this.selectedImagesIndexes.push(indexClicked);
      this.selectedImagesIndexes.sort((a, b) => a - b);

      // add index to list array
      const positionInList = this.optionsByImages[indexClicked];
      if (
        positionInList !== undefined &&
        !this.selectedIndexes.includes(positionInList)
      ) {
        this.selectedIndexes.push(positionInList);
        this.selectedIndexes.sort((a, b) => a - b);
      }
    }

    /*
    console.log('IMAGENES POR OPCIONES', this.imagesByOption);
    console.log('OPCIONES POR IMAGENES', this.optionsByImages);

    console.log('EN EL GRID', this.selectedImagesIndexes);
    console.log('EN LA LISTA', this.selectedIndexes);
    */

    this.emitMultipleSelectedOptions();
  }

  emitMultipleSelectedOptions() {
    let copyCompleteAnswers: Array<ExtendedAnswerDefault> = JSON.parse(
      JSON.stringify(this.completeAnswers)
    );

    const selectedIndexesFromGrid = this.selectedImagesIndexes.map(
      (selectedIndex, index) =>
        this.gridImageIndexesInCompleteAnswers[selectedIndex]
    );

    const selectedIndexesFromList = this.selectedIndexes.map(
      (selectedIndex, index) =>
        this.answerSelectorIndexesInCompleteAnswers[selectedIndex]
    );

    let selectedIndexesForFullList = [
      ...selectedIndexesFromGrid,
      ...selectedIndexesFromList,
    ];
    selectedIndexesForFullList = [...new Set(selectedIndexesForFullList)].sort(
      (a, b) => a - b
    );

    copyCompleteAnswers = copyCompleteAnswers.map((option, index) => ({
      ...option,
      selected: selectedIndexesForFullList.includes(index),
    }));

    this.completeAnswers = copyCompleteAnswers;

    this.dialogFlowService.dialogsFlows[
      this.dialogFlowService.selectedQuestion?.flowId
    ][this.dialogFlowService.selectedQuestion?.dialogId].fields.options =
      copyCompleteAnswers;

    const justSelectedOptions = copyCompleteAnswers.filter(
      (option) => option.selected
    );

    if (this.required) {
      this.dialogFlowService.dialogsFlows[
        this.dialogFlowService.selectedQuestion?.flowId
      ][this.dialogFlowService.selectedQuestion?.dialogId].fields.valid =
        justSelectedOptions.length > 0;
    }

    this.fillInitialValuesForLists();
  }
}
