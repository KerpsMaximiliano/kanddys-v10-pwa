import { Component, Input, Output, OnInit, EventEmitter } from '@angular/core';
import { FormControl, Validator } from '@angular/forms';
import { CountryISO, PhoneNumberFormat } from 'ngx-intl-tel-input';
import { DialogFlowService } from 'src/app/core/services/dialog-flow.service';

@Component({
  selector: 'app-webform-textarea-question',
  templateUrl: './webform-textarea-question.component.html',
  styleUrls: ['./webform-textarea-question.component.scss'],
})
export class WebformTextareaQuestionComponent implements OnInit {
  @Input() label: string = 'PreguntaID';
  @Input() textarea: FormControl = new FormControl('');
  @Input() containerStyles: Record<string, any> = {
    opacity: 1
  };
  @Input() dialogFlowConfig: {
    dialogId: string;
    flowId: string;
  };
  @Input() inputType: string = null;
  @Input() skipValidationBlock : boolean = false;
  @Output() inputDetected = new EventEmitter();
  preferredCountries: CountryISO[] = [
    CountryISO.DominicanRepublic,
    CountryISO.UnitedStates,
  ];
  PhoneNumberFormat = PhoneNumberFormat;

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

      if(!this.skipValidationBlock) {
        this.dialogFlowService.dialogsFlows[this.dialogFlowConfig.flowId][
          this.dialogFlowConfig.dialogId
        ].swiperConfig.allowSlideNext = this.textarea.valid;
      } else {
        this.dialogFlowService.dialogsFlows[this.dialogFlowConfig.flowId][
          this.dialogFlowConfig.dialogId
        ].swiperConfig.allowSlideNext = true;        
      }
    }

    this.inputDetected.emit( this.inputType !== 'PHONE' ? this.textarea.value : this.textarea.value?.e164Number?.split('+')[1]);
  };
}
