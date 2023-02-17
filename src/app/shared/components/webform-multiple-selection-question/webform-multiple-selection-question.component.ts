import { Component, Input, Output, OnInit, EventEmitter } from '@angular/core';
import { FormControl, Validator } from '@angular/forms';
import { DialogFlowService } from 'src/app/core/services/dialog-flow.service';

@Component({
  selector: 'app-webform-multiple-selection-question',
  templateUrl: './webform-multiple-selection-question.component.html',
  styleUrls: ['./webform-multiple-selection-question.component.scss'],
})
export class WebformMultipleSelectionQuestionComponent implements OnInit {
  @Input() label: string = 'PreguntaID';
  @Input() options: Array<{
    text: string;
    active: boolean;
  }> = [];
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
