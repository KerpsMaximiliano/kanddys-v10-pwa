import { Component, Input, Output, OnInit, EventEmitter } from '@angular/core';
import { FormControl, Validator } from '@angular/forms';
import { AnswerDefault } from 'src/app/core/models/webform';
import { DialogFlowService } from 'src/app/core/services/dialog-flow.service';

export interface ExtendedAnswerDefault extends AnswerDefault {
  userProvidedAnswer?: string;
}

@Component({
  selector: 'app-webform-multiple-selection-question',
  templateUrl: './webform-multiple-selection-question.component.html',
  styleUrls: ['./webform-multiple-selection-question.component.scss'],
})
export class WebformMultipleSelectionQuestionComponent implements OnInit {
  @Input() label: string = 'PreguntaID';
  @Input() options: Array<ExtendedAnswerDefault> = [];
  @Input() optionsInput: Array<any> = [];
  @Input() multiple: boolean = false;
  @Input() shadows: boolean = true;
  @Input() questionType: 'multiple' | 'multiple-text' = 'multiple';
  @Input() containerStyles: Record<string, any> = {
    opacity: 1,
  };
  @Input() dialogFlowConfig: {
    dialogId: string;
    flowId: string;
  };
  @Input() selectedIndex: number = null;
  @Input() selectedImageGridIndex: number = null;
  @Input() selectedIndexes: number = null;
  @Input() selectedImagesGridIndexes: number = null;
  @Output() inputDetected = new EventEmitter();
  layoutType = {
    'JUST-TEXT': 1,
    'JUST-IMAGES': 2,
    'IMAGES-AND-TEXT': 3,
  };
  layout: number = null;

  constructor(private dialogFlowService: DialogFlowService) {}

  ngOnInit(): void {

    //If it's used in combination with dialogFlow, sets the data on the service
    if (this.dialogFlowConfig) {
      if (
        'options' in
        this.dialogFlowService.dialogsFlows[this.dialogFlowConfig.flowId][
          this.dialogFlowConfig.dialogId
        ].fields
      ) {
        this.options =
          this.dialogFlowService.dialogsFlows[this.dialogFlowConfig.flowId][
            this.dialogFlowConfig.dialogId
          ].fields.options;
      } else {
        this.dialogFlowService.dialogsFlows[this.dialogFlowConfig.flowId][
          this.dialogFlowConfig.dialogId
        ].fields.options = [];
      }
    }

    
    this.optionsInput = this.options.map((option) => {
      if (option.isMedia && option.label) {
        return {
          text: option.label,
          img: option.value,
          isMedia: option.isMedia,
        };
      } else if (option.isMedia && !option.label) {
        return {
          text: null,
          img: option.value,
          isMedia: option.isMedia,
        };
      } else if (!option.isMedia && option.value) {
        return {
          text: option.value,
          img: null,
          isMedia: option.isMedia,
        };
      }
    });
  }

  emitInput = (optionsSelected: {
    option: number;
    image: number;
    selectedOptionOrText: string;
  }) => {
    //Get the selected index from the full list(images-grid, list-option)
    const selectedOptionIndex = this.options.findIndex(
      (optionInList, index) => {
        if (optionsSelected.option === index && this.questionType === 'multiple-text') {
          return true;
        }

        if (
          optionInList.isMedia &&
          (optionInList.value === optionsSelected.selectedOptionOrText ||
            optionInList.label === optionsSelected.selectedOptionOrText)
        )
          return true;
        if (
          !optionInList.isMedia &&
          optionInList.value === optionsSelected.selectedOptionOrText
        )
          return true;
      }
    );

    //stablish with options in the list are selected
    this.options = this.options.map((option, index) => ({
      ...option,
      selected: index === selectedOptionIndex,
    }));

    this.selectedIndex = selectedOptionIndex;


    //Adds the user provided answer to the output sent to the parent component
    if (this.questionType === 'multiple-text'&& optionsSelected.option === this.options.length - 1)
      this.options[this.selectedIndex].userProvidedAnswer =
        optionsSelected.selectedOptionOrText;

    if (this.dialogFlowConfig) {
      this.dialogFlowService.dialogsFlows[this.dialogFlowConfig.flowId][
        this.dialogFlowConfig.dialogId
      ].fields.options = this.options;
    }

    this.inputDetected.emit(this.options);

    //Get the selected index for the image grid
    let selectedIndexFromImageGrid = null;
    let selectedIndexFromList = null;
    const justImagesGrid = this.options.filter(
      (option, index) => option.isMedia && option.value
    );
    selectedIndexFromImageGrid = justImagesGrid.findIndex(
      (option) => option.value === this.options[selectedOptionIndex]?.value
    );

    if (selectedIndexFromImageGrid >= 0) {
      this.selectedImageGridIndex = selectedIndexFromImageGrid;
    }

    //Get the selected index for the list of options in the answer selector
    const listOptionsGrid = this.options.filter(
      (option, index) =>
        (!option.isMedia && option.value) || (option.isMedia && option.label)
    );
    selectedIndexFromList = listOptionsGrid.findIndex(
      (option) =>
        option.value === this.options[selectedOptionIndex]?.value ||
        option.label === this.options[selectedOptionIndex]?.value
    );

    if (selectedIndexFromList >= 0) {
      this.selectedIndex = selectedIndexFromList;
    } else {
      this.selectedIndex = null;
    }
  };

  emitInputMultiple = (optionsSelected: Array<{
    option: number;
    image: number;
    selectedOptionOrText: string;
  }>) => {
    
    /*
    //Get the selected index from the full list(images-grid, list-option)
    const selectedOptionIndex = this.options.findIndex(
      (optionInList, index) => {
        if (optionsSelected.option === index && this.questionType === 'multiple-text') {
          return true;
        }

        if (
          optionInList.isMedia &&
          (optionInList.value === optionsSelected.selectedOptionOrText ||
            optionInList.label === optionsSelected.selectedOptionOrText)
        )
          return true;
        if (
          !optionInList.isMedia &&
          optionInList.value === optionsSelected.selectedOptionOrText
        )
          return true;
      }
    );

    //stablish with options in the list are selected
    this.options = this.options.map((option, index) => ({
      ...option,
      selected: index === selectedOptionIndex,
    }));

    this.selectedIndex = selectedOptionIndex;


    //Adds the user provided answer to the output sent to the parent component
    if (this.questionType === 'multiple-text'&& optionsSelected.option === this.options.length - 1)
      this.options[this.selectedIndex].userProvidedAnswer =
        optionsSelected.selectedOptionOrText;

    if (this.dialogFlowConfig) {
      this.dialogFlowService.dialogsFlows[this.dialogFlowConfig.flowId][
        this.dialogFlowConfig.dialogId
      ].fields.options = this.options;
    }

    this.inputDetected.emit(this.options);

    //Get the selected index for the image grid
    let selectedIndexFromImageGrid = null;
    let selectedIndexFromList = null;
    const justImagesGrid = this.options.filter(
      (option, index) => option.isMedia && option.value
    );
    selectedIndexFromImageGrid = justImagesGrid.findIndex(
      (option) => option.value === this.options[selectedOptionIndex]?.value
    );

    if (selectedIndexFromImageGrid >= 0) {
      this.selectedImageGridIndex = selectedIndexFromImageGrid;
    }

    //Get the selected index for the list of options in the answer selector
    const listOptionsGrid = this.options.filter(
      (option, index) =>
        (!option.isMedia && option.value) || (option.isMedia && option.label)
    );
    selectedIndexFromList = listOptionsGrid.findIndex(
      (option) =>
        option.value === this.options[selectedOptionIndex]?.value ||
        option.label === this.options[selectedOptionIndex]?.value
    );

    if (selectedIndexFromList >= 0) {
      this.selectedIndex = selectedIndexFromList;
    } else {
      this.selectedIndex = null;
    }*/
  };
}
