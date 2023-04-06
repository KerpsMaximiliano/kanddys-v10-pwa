import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormArray, FormControl, FormGroup, Validators } from '@angular/forms';

export interface formInput {
  label?: string,
  placeholder?: string,
  formControl?: string,
  value: any,
  type?: 'text' | 'number',
  required?: boolean,
  styles?: Record<string, string>,
  index: number,
  row?: number,
  column?: number,
  isFlex?: boolean,
  halfWidth?: boolean,
}

@Component({
  selector: 'app-dialog-form',
  templateUrl: './dialog-form.component.html',
  styleUrls: ['./dialog-form.component.scss']
})
export class DialogFormComponent implements OnInit {

  @Input('dialogId') dialogId: string;

  @Input('title') title: {
    styles?: Record<string, string>;
    text?: string;
  } = {};

  @Input('fields') fields: {
    styles?: Record<string, string>;
    inputs?: Array<formInput>;
  } = {};

  inputs: Array<formInput>;

  form: FormGroup;

  rows: any[] = [];
  columns: number[] = [];
  formValues: any[] = [];

  @Output('formSubmit') formSubmit = new EventEmitter<any>();

  constructor() {}

  ngOnInit(): void {
    const inputs = this.fields.inputs.map(row => row);
    const inputControls = inputs.map(input => new FormControl(input.value, input.required ? [Validators.required] : []));
    this.form = new FormGroup({
      inputArray: new FormArray(inputControls)
    });

    this.inputs = inputs.map(input => input);

    const rowSet = new Set<number>();

    inputs.forEach((input) => {
      const index = input.row;
      if (!rowSet.has(index)) {
        rowSet.add(index);
        this.rows.push({
          index,
          isFlex: input.isFlex ? input.isFlex : false,
          halfWidth: input.halfWidth ? input.halfWidth : false,
        });
      }
    });
    console.log(this.rows);
    this.columns = Array.from(new Set(inputs.map(item => item.column)));

    console.log(this.fields.inputs);
  }

  onKeyPress(event?: any, id?: any) {
    const formData = [];
    this.formValues = this.form.value.inputArray;
    const formValue = this.form.value.inputArray;

    if ((event || event === 0) && id) {
      console.log(event);
      const inputIndex = this.fields.inputs.indexOf(this.fields.inputs.find(input => input.formControl === id));
      (this.form.get('inputArray') as FormArray).controls[inputIndex].setValue(event);
      console.log(this.form.value.inputArray);
      formValue[inputIndex] = event;
    }

    console.log(formValue);

    for (let i = 0; i < formValue.length; i++) {
      const input = this.fields.inputs[i];
      formData.push({
        label: input.label,
        value: formValue[i],
        row: input.row,
        column: input.column
      });
    }
    this.formSubmit.emit(formData);
  }

}