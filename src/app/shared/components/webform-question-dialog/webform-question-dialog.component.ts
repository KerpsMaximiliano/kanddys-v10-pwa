import { Component, Input, Output, OnInit, EventEmitter, ViewEncapsulation } from '@angular/core';
import { FormControl, Validator } from '@angular/forms';
import { DialogFlowService } from 'src/app/core/services/dialog-flow.service';

@Component({
  selector: 'app-webform-question-dialog',
  templateUrl: './webform-question-dialog.component.html',
  styleUrls: ['./webform-question-dialog.component.scss']
})
export class WebformQuestionDialogComponent implements OnInit {
  @Input() label: string = 'PreguntaID';
  @Input() textarea: FormControl = new FormControl('');
  @Input() containerStyles: Record<string, any> = {
    opacity: 1
  };
  @Input() dialogFlowConfig: {
    dialogId: string;
    flowId: string;
  };
  @Output() inputDetected = new EventEmitter();
  @Output() requiredQuestion = false;

  constructor(private dialogFlowService: DialogFlowService) {}

  ngOnInit(): void {
    if (this.dialogFlowConfig) {
      if (
        'textarea' in
        this.dialogFlowService.dialogsFlows[this.dialogFlowConfig.flowId][
          this.dialogFlowConfig.dialogId
        ].fields
      ) {
        this.textarea.setValue(
          this.dialogFlowService.dialogsFlows[this.dialogFlowConfig.flowId][
            this.dialogFlowConfig.dialogId
          ].fields.textarea
        );
      } else {
        this.dialogFlowService.dialogsFlows[this.dialogFlowConfig.flowId][
          this.dialogFlowConfig.dialogId
        ].fields.textarea = '';
      }

      this.textarea.valueChanges.subscribe(this.emitInput);
    }
  }

  emitInput = () => {
    if (this.dialogFlowConfig) {
      this.dialogFlowService.dialogsFlows[this.dialogFlowConfig.flowId][
        this.dialogFlowConfig.dialogId
      ].fields.textarea = this.textarea.value;

      this.dialogFlowService.dialogsFlows[this.dialogFlowConfig.flowId][
        this.dialogFlowConfig.dialogId
      ].swiperConfig.allowSlideNext = this.textarea.valid;
    }

    this.inputDetected.emit(this.textarea.value);
  };
}
