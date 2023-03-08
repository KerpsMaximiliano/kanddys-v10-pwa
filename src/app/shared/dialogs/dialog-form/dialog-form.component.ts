import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormArray, FormControl, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-dialog-form',
  templateUrl: './dialog-form.component.html',
  styleUrls: ['./dialog-form.component.scss']
})
export class DialogFormComponent implements OnInit {

  @Input('title') title: {
    styles?: Record<string, string>;
    text?: string;
  } = {};

  @Input('fields') fields: {
    styles?: Record<string, string>;
    inputs?: Array<{
      label?: string,
      placeholder?: string,
      formControl?: string,
      type?: string,
      styles?: Record<string, string>,
      row?: number,
      column?: number,
      isFlex: boolean
    }>;
  } = {};

  form: FormGroup;

  rows: number[];
  columns: number[];

  @Output('formSubmit') formSubmit = new EventEmitter<any>();

  constructor() {}

  ngOnInit(): void {
    const inputs = this.fields.inputs.map(row => row);
    console.log(inputs);
    const inputControls = inputs.map(input => new FormControl(""))
    this.form = new FormGroup({
      inputArray: new FormArray(inputControls)
    });

    this.rows = Array.from(new Set(inputs.map(item => item.row)));
    this.columns = Array.from(new Set(inputs.map(item => item.column)));
  }

  onKeyPress() {
    const formData = [];
    const formValue = this.form.value.inputArray;
    for (let i = 0; i < formValue.length; i++) {
      const input = this.fields.inputs[i];
      formData.push({
        label: input.label,
        value: formValue[i],
        row: input.row,
        column: input.column
      });
    }

    console.log(formData);
    this.formSubmit.emit(formData);
  }

}
