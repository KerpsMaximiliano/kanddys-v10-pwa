import {
  Component,
  OnInit,
  Input,
  Output,
  EventEmitter,
  OnDestroy,
} from '@angular/core';
import { FormControl } from '@angular/forms';
import {
  DialogFlowService,
  WebformMultipleOptionIDs,
} from 'src/app/core/services/dialog-flow.service';
import { OptionAnswerSelector } from 'src/app/core/types/answer-selector';
import { environment } from 'src/environments/environment';
import { ExtendedAnswerDefault } from '../webform-multiple-selection-question/webform-multiple-selection-question.component';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-closed-question-card',
  templateUrl: './closed-question-card.component.html',
  styleUrls: ['./closed-question-card.component.scss'],
})
export class ClosedQuestionCardComponent implements OnInit, OnDestroy {
  env: string = environment.assetsUrl;
  @Input() dialogFlowConfig: {
    dialogId: string;
    flowId: string;
  };
  @Input() startWithDialogFlow: boolean = false;
  @Input() restartFromEvent: boolean = false;
  @Input() multiple: boolean = true;
  @Input() questionType: string = 'multiple';
  @Input() question: string;
  @Input() required: boolean = false;
  @Input() completeAnswers: Array<ExtendedAnswerDefault> = []; //Array of images by options
  @Input() optionsInAnswerSelector: Array<OptionAnswerSelector> = []; //Array of answer selector options
  @Input() optionsInImageGrid: Array<ExtendedAnswerDefault> = []; //Array of images by options
  @Input() gridImageIndexesInCompleteAnswers: Record<number, number> = {}; //Array of images by options
  @Input() answerSelectorIndexesInCompleteAnswers: Record<number, number> = {}; //Array of images by options
  @Input() userProvidedAnswerSelected: boolean = false;
  @Input() userProvidedAnswer: FormControl = new FormControl('');
  @Output() onSelector = new EventEmitter<boolean>();
  subscription: Subscription;

  optionsByImages: Record<number, number> = {}; //index of option, index of image
  imagesByOption: Record<number, number> = {}; //index of image, index of option

  @Input() selected: number = null;
  @Input() selectedImage: number = null;
  @Input() selectedIndexes: Array<number> = [];
  @Input() selectedImagesIndexes: Array<number> = [];
  @Input() id: string;
  @Input() type: number = 1;
  @Input() shadows: boolean = true;
  @Input() containerStyles: Record<string, any> = null;
  @Input() labelStyles: Record<string, any> = null;

  constructor(private dialogFlowService: DialogFlowService) {}

  ngOnInit(): void {
    this.initProcesses();

    if (this.restartFromEvent === true) {
      this.subscription =
        this.dialogFlowService.updateMultipleSelectionDialog.subscribe(
          (data: WebformMultipleOptionIDs) => {
            this.startWithDialogFlow = true;

            if (
              data.dialogId === this.dialogFlowConfig.dialogId &&
              data.flowId === this.dialogFlowConfig.flowId
            )
              this.initProcesses();
          }
        );
    }
  }

  initProcesses() {
    if (this.dialogFlowConfig && !this.startWithDialogFlow && !this.multiple) {
      this.fillInitialValuesForSingleResponse();
    } else if (
      this.dialogFlowConfig &&
      this.startWithDialogFlow &&
      !this.multiple
    ) {
      this.setCompleteAnswersFromDialogFlow();
      this.fillInitialValuesForSingleResponse();
    } else if (
      this.dialogFlowConfig &&
      !this.startWithDialogFlow &&
      this.multiple
    ) {
      this.fillInitialValuesForMultipleResponse();
    } else if (
      this.dialogFlowConfig &&
      this.startWithDialogFlow &&
      this.multiple
    ) {
      this.setCompleteAnswersFromDialogFlow();
      this.fillInitialValuesForMultipleResponse();
    }

    //Fills optionsByImages
    this.optionsInImageGrid.forEach((optionInImageGrid, index) => {
      this.optionsInAnswerSelector.forEach((optionInAnswerSelector, index2) => {
        if (optionInImageGrid.label === optionInAnswerSelector.value) {
          this.optionsByImages[index] = index2;
          this.imagesByOption[index2] = index;
        }
      });
    });

    this.userProvidedAnswer.valueChanges.subscribe((change) => {
      if (this.userProvidedAnswerSelected) {
        const selectedOptions = JSON.parse(
          JSON.stringify(this.completeAnswers)
        ).map((option, currentIndex) => {
          if (currentIndex === this.completeAnswers.length - 1) {
            option.selected = true;
            option.userProvidedAnswer = change;
          }

          return option;
        });

        const justSelectedOptions = selectedOptions.filter(
          (option) => option.selected
        );

        this.dialogFlowService.dialogsFlows[this.dialogFlowConfig.flowId][
          this.dialogFlowConfig.dialogId
        ].fields.options = selectedOptions;

        if (this.required) {
          this.dialogFlowService.dialogsFlows[this.dialogFlowConfig.flowId][
            this.dialogFlowConfig.dialogId
          ].fields.valid = justSelectedOptions.length > 0;
        }

        this.onSelector.emit(true);
      }
    });

    if (!this.required) {
      this.dialogFlowService.dialogsFlows[this.dialogFlowConfig.flowId][
        this.dialogFlowConfig.dialogId
      ].fields.valid = true;
    }
  }

  setCompleteAnswersFromDialogFlow() {
    this.completeAnswers =
      this.dialogFlowService.dialogsFlows[this.dialogFlowConfig.flowId][
        this.dialogFlowConfig.dialogId
      ].fields.options;
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

    if (this.startWithDialogFlow && !this.multiple) {
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

        if (this.questionType === 'multiple-text') {
          this.userProvidedAnswerSelected =
            selectedOptionInAnswerSelector ===
            this.optionsInAnswerSelector.length - 1;

          this.userProvidedAnswer.setValue(
            this.userProvidedAnswerSelected
              ? this.completeAnswers[selectedOptionInAnswerSelector]
                  .userProvidedAnswer
              : null
          );
        }
      }
    }
  }

  fillInitialValuesForMultipleResponse() {
    this.fillInitialValuesForLists();

    if (this.startWithDialogFlow && this.multiple) {
      this.setSelectedIndexesFromLists();
    }
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

    if (
      this.selectedIndexes.includes(this.optionsInAnswerSelector.length - 1) &&
      this.questionType === 'multiple-text'
    ) {
      this.userProvidedAnswerSelected = true;

      this.userProvidedAnswer.setValue(
        this.completeAnswers[this.completeAnswers.length - 1]
          .userProvidedAnswer || ''
      );
    }
  }

  selectOpt(index: number, from: 'GRID' | 'OPTIONS-LIST', imageRoute?: string) {
    if (!from || !['GRID', 'OPTIONS-LIST'].includes(from)) return null;

    if (from === 'GRID') {
      //this.selected = this.imagesByOption[index];
      this.selected = this.optionsByImages[index];
      this.selectedImage = index;
    } else if (from === 'OPTIONS-LIST') {
      this.selected = index;
      this.selectedImage = this.imagesByOption[index];

      if (
        this.questionType === 'multiple-text' &&
        !this.userProvidedAnswerSelected &&
        index === this.optionsInAnswerSelector.length - 1
      ) {
        this.userProvidedAnswerSelected = true;
        this.userProvidedAnswer.setValue('');
        return;
      } else if (
        this.questionType === 'multiple-text' &&
        this.userProvidedAnswerSelected
      ) {
        this.userProvidedAnswerSelected = false;
        this.completeAnswers[
          this.completeAnswers.length - 1
        ].userProvidedAnswer = null;
      }
    }

    const selectedOptions = JSON.parse(
      JSON.stringify(this.completeAnswers)
    ).map((option, currentIndex) => {
      switch (from) {
        case 'GRID':
          if (
            this.gridImageIndexesInCompleteAnswers[this.selectedImage] ===
            currentIndex
          ) {
            option.selected = true;
          } else {
            option.selected = false;
          }
          break;
        case 'OPTIONS-LIST':
          if (
            this.answerSelectorIndexesInCompleteAnswers[this.selected] ===
            currentIndex
          )
            option.selected = true;
          else {
            option.selected = false;
          }
          break;
      }

      return option;
    });

    this.dialogFlowService.dialogsFlows[this.dialogFlowConfig.flowId][
      this.dialogFlowConfig.dialogId
    ].fields.options = selectedOptions;

    const justSelectedOptions = selectedOptions.filter(
      (option) => option.selected
    );

    //console.log('DESPUES', this.completeAnswers);

    if (this.required) {
      this.dialogFlowService.dialogsFlows[this.dialogFlowConfig.flowId][
        this.dialogFlowConfig.dialogId
      ].fields.valid = justSelectedOptions.length > 0;
    }

    this.onSelector.emit(true);
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

    this.dialogFlowService.dialogsFlows[this.dialogFlowConfig.flowId][
      this.dialogFlowConfig.dialogId
    ].fields.options = copyCompleteAnswers;

    const justSelectedOptions = copyCompleteAnswers.filter(
      (option) => option.selected
    );

    if (this.required) {
      this.dialogFlowService.dialogsFlows[this.dialogFlowConfig.flowId][
        this.dialogFlowConfig.dialogId
      ].fields.valid = justSelectedOptions.length > 0;
    }

    this.onSelector.emit(true);
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

  //HANDLES THE CASE WHEN A BUTTON OF THE ANSWER SELECTOR IS CLICKED(WHEN MULTIPLE SELECTION IS ENABLED)
  selectOptMultipleFromList(indexes: Array<number>) {
    this.selectedIndexes = indexes;
    let imagesIndexesToInclude = [];

    // Check which images need to be added or removed from `selectedImageIndexes`
    for (const index of indexes) {
      const isImageByOptionNotFalsy =
        this.imagesByOption[index] !== null &&
        this.imagesByOption[index] !== undefined;

      if (
        isImageByOptionNotFalsy &&
        !this.selectedImagesIndexes.includes(this.imagesByOption[index])
      ) {
        imagesIndexesToInclude.push(this.imagesByOption[index]);
      } else if (
        isImageByOptionNotFalsy &&
        this.selectedImagesIndexes.includes(this.imagesByOption[index])
      ) {
        imagesIndexesToInclude.push(this.imagesByOption[index]);
      }
    }

    //Finds the selectedImageIndexes that are not in imagesByOption and adds them to imagesIndexesToInclude
    const notInImagesByOption = this.selectedImagesIndexes.filter(
      (index) =>
        this.optionsByImages[index] === null ||
        this.optionsByImages[index] === undefined
    );

    imagesIndexesToInclude.push(...notInImagesByOption);

    imagesIndexesToInclude = [...new Set(imagesIndexesToInclude)].sort(
      (a, b) => a - b
    );

    this.selectedImagesIndexes = imagesIndexesToInclude;

    if (
      this.questionType === 'multiple-text' &&
      !this.userProvidedAnswerSelected &&
      indexes.includes(this.optionsInAnswerSelector.length - 1)
    ) {
      this.userProvidedAnswerSelected = true;
      this.userProvidedAnswer.setValue('');
      return;
    } else if (
      this.questionType === 'multiple-text' &&
      this.userProvidedAnswerSelected
    ) {
      this.userProvidedAnswerSelected = false;
      this.completeAnswers[this.completeAnswers.length - 1].userProvidedAnswer =
        null;
    }

    this.emitMultipleSelectedOptions();
  }

  ngOnDestroy() {
    if (this.subscription) this.subscription.unsubscribe();
  }
}
