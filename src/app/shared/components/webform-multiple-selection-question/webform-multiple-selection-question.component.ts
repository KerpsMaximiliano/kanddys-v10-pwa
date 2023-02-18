import { Component, Input, Output, OnInit, EventEmitter } from '@angular/core';
import { FormControl, Validator } from '@angular/forms';
import { AnswerDefault } from 'src/app/core/models/webform';
import { DialogFlowService } from 'src/app/core/services/dialog-flow.service';

@Component({
  selector: 'app-webform-multiple-selection-question',
  templateUrl: './webform-multiple-selection-question.component.html',
  styleUrls: ['./webform-multiple-selection-question.component.scss'],
})
export class WebformMultipleSelectionQuestionComponent implements OnInit {
  @Input() label: string = 'PreguntaID';
  @Input() options: Array<AnswerDefault> = [];
  @Input() optionsInput: Array<any> = [];
  @Input() multiple: boolean = false;
  @Input() containerStyles: Record<string, any> = {
    opacity: 1,
  };
  @Input() dialogFlowConfig: {
    dialogId: string;
    flowId: string;
  };
  @Input() selectedIndex: number = null;
  @Output() inputDetected = new EventEmitter();
  layoutType = {
    'JUST-TEXT': 1,
    'JUST-IMAGES': 2,
    'IMAGES-AND-TEXT': 3,
  };
  layout: number = null;

  constructor(private dialogFlowService: DialogFlowService) {}

  ngOnInit(): void {
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
    
    if (this.options.length && !this.options[0].isMedia) {
      this.layout = this.layoutType['JUST-TEXT'];
    } else if (
      this.options.length &&
      this.options[0].isMedia &&
      this.options[0].label
    ) {
      this.layout = this.layoutType['IMAGES-AND-TEXT'];
    } else if (
      this.options.length &&
      this.options[0].isMedia &&
      !this.options[0].label
    ) {
      this.layout = this.layoutType['JUST-IMAGES'];
    }

    if (
      this.layout === this.layoutType['JUST-IMAGES'] ||
      this.layout === this.layoutType['IMAGES-AND-TEXT']
    ) {
      this.optionsInput = this.options.map((option) => ({
        text: option.label,
        img: option.value,
      }));
    } else {
      this.optionsInput = this.options.map((option) => ({
        text: option.value,
      }));
    }
  }

  emitInput = (selectedOptionIndex: number) => {
    this.options = this.options.map((option, index) => ({
      ...option,
      selected: index === selectedOptionIndex,
    }));
    this.selectedIndex = selectedOptionIndex;
    if (this.dialogFlowConfig) {
      this.dialogFlowService.dialogsFlows[this.dialogFlowConfig.flowId][
        this.dialogFlowConfig.dialogId
      ].fields.options = this.options;
    }

    this.inputDetected.emit(this.options);
  };
}
