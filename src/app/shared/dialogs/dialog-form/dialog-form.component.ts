import { Component, Input, OnInit } from '@angular/core';
import { FormArray, FormControl, FormGroup } from '@angular/forms';

export interface DialogFormField {
  columns: Array<{
    label?: string,
    placeholder?: string,
    formControl?: string,
    type?: string
    styles?: Record<string, string>;
  }>
}

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

    // TODO: Cambiar estructura para que sea un solo array y que cada elemento maneje su respectivo index
    rows?: Array<DialogFormField>;
  } = {};

  form: FormGroup;

  constructor() {}

  ngOnInit(): void {
    console.log(this.fields.rows);
    const inputs = this.fields.rows.map(row => {
      return row.columns
    });

    console.log(inputs);

    const inputControls = inputs.map(input => new FormControl(""))
    this.form = new FormGroup({
      inputArray: new FormArray(inputControls)
    });
  }

}
