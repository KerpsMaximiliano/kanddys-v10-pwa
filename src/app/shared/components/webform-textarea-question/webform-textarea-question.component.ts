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
    opacity: 1,
  };
  @Input() dialogFlowConfig: {
    dialogId: string;
    flowId: string;
  };
  @Input() inputType: string = null;
  @Output() inputDetected = new EventEmitter();
  preferredCountries: CountryISO[] = [
    CountryISO.DominicanRepublic,
    CountryISO.UnitedStates,
  ];
  PhoneNumberFormat = PhoneNumberFormat;

  constructor(private dialogFlowService: DialogFlowService) {}

  ngOnInit(): void {
    const { textarea, phoneInput } =
      this.dialogFlowService.dialogsFlows[this.dialogFlowConfig.flowId][
        this.dialogFlowConfig.dialogId
      ].fields;

    if (this.dialogFlowConfig) {
      if (
        'textarea' in
        this.dialogFlowService.dialogsFlows[this.dialogFlowConfig.flowId][
          this.dialogFlowConfig.dialogId
        ].fields
      ) {
        this.textarea.setValue(
          this.inputType !== 'PHONE' ? textarea : phoneInput
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
      ].fields.textarea =
        this.inputType !== 'PHONE'
          ? this.textarea.value
          : this.textarea.value?.e164Number?.split('+')[1];

      if (this.inputType === 'PHONE') {
        this.dialogFlowService.dialogsFlows[this.dialogFlowConfig.flowId][
          this.dialogFlowConfig.dialogId
        ].fields.phoneInput = this.textarea.value;
      }

      this.dialogFlowService.dialogsFlows[this.dialogFlowConfig.flowId][
        this.dialogFlowConfig.dialogId
      ].fields.valid = this.textarea.valid;
    }

    this.inputDetected.emit(true);
  };
}
