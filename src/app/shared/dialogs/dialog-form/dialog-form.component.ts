import { Component, Input, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';

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
    rows?: Array<DialogFormField>;
  } = {};

  form: FormGroup;

  constructor() { }

  ngOnInit(): void {
  }

}
