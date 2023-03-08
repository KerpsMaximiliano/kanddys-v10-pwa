import { Component, Input, Output, OnInit, EventEmitter } from '@angular/core';
import { FormControl, Validator, FormGroup, Validators } from '@angular/forms';
import { DialogFlowService } from 'src/app/core/services/dialog-flow.service';

@Component({
  selector: 'app-webform-name-question',
  templateUrl: './webform-name-question.component.html',
  styleUrls: ['./webform-name-question.component.scss'],
})
export class WebformNameQuestionComponent implements OnInit {
  @Input() label: string = 'PreguntaID';
  @Input() form: FormGroup = new FormGroup({
    name: new FormControl('', Validators.required),
    lastname: new FormControl('', Validators.required),
  });
  @Input() containerStyles: Record<string, any> = {
    opacity: 1,
  };
  @Input() dialogFlowConfig: {
    dialogId: string;
    flowId: string;
  };
  @Input() inputType: string = null;
  @Input() skipValidationBlock: boolean = false;
  @Output() inputDetected = new EventEmitter();

  constructor(private dialogFlowService: DialogFlowService) {}

  ngOnInit(): void {
    if (this.dialogFlowConfig) {
      if (
        'name' in
        this.dialogFlowService.dialogsFlows[this.dialogFlowConfig.flowId][
          this.dialogFlowConfig.dialogId
        ].fields
      ) {
        this.form
          .get('name')
          .setValue(
            this.dialogFlowService.dialogsFlows[this.dialogFlowConfig.flowId][
              this.dialogFlowConfig.dialogId
            ].fields.name
          );
      } else {
        this.dialogFlowService.dialogsFlows[this.dialogFlowConfig.flowId][
          this.dialogFlowConfig.dialogId
        ].fields.name = '';
      }

      if (
        'lastname' in
        this.dialogFlowService.dialogsFlows[this.dialogFlowConfig.flowId][
          this.dialogFlowConfig.dialogId
        ].fields
      ) {
        this.form
          .get('lastname')
          .setValue(
            this.dialogFlowService.dialogsFlows[this.dialogFlowConfig.flowId][
              this.dialogFlowConfig.dialogId
            ].fields.lastname
          );
      } else {
        this.dialogFlowService.dialogsFlows[this.dialogFlowConfig.flowId][
          this.dialogFlowConfig.dialogId
        ].fields.lastname = '';
      }

      this.form.valueChanges.subscribe(this.emitInput);
    }
  }

  emitInput = () => {
    if (this.dialogFlowConfig) {
      this.dialogFlowService.dialogsFlows[this.dialogFlowConfig.flowId][
        this.dialogFlowConfig.dialogId
      ].fields.name = this.form.get('name').value;

      this.dialogFlowService.dialogsFlows[this.dialogFlowConfig.flowId][
        this.dialogFlowConfig.dialogId
      ].fields.lastname = this.form.get('lastname').value;

      this.dialogFlowService.dialogsFlows[this.dialogFlowConfig.flowId][
        this.dialogFlowConfig.dialogId
      ].fields.valid = this.form.get('lastname').valid && this.form.get('lastname').valid;
    }

    this.inputDetected.emit(
      true
    );
  };
}
