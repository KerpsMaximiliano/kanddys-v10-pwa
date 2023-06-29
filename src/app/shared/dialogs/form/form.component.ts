import { Component, OnInit, Inject } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validator,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import {
  MatDialog,
  MAT_DIALOG_DATA,
  MatDialogRef,
  MatDialogModule,
} from '@angular/material/dialog';

interface Field {
  type: 'text' | 'email' | 'phone' | 'file';
  validators: Array<ValidatorFn>;
  name: string;
  label: string;
}

export interface FormData {
  fields: Array<Field>;
}

@Component({
  selector: 'app-form',
  templateUrl: './form.component.html',
  styleUrls: ['./form.component.scss'],
})
export class FormComponent implements OnInit {
  formGroup: FormGroup;

  constructor(
    public dialogRef: MatDialogRef<FormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: FormData,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.formGroup = this.fb.group({});
    for (const field of this.data.fields) {
      let fieldToInsert = null;

      switch (field.type) {
        case 'text':
          fieldToInsert = new FormControl('', field.validators);
          break;
        case 'email':
          fieldToInsert = new FormControl(
            '',
            field.validators.concat(Validators.email)
          );
          break;
      }

      this.formGroup.addControl(field.name, fieldToInsert);
    }
  }

  close(): void {
    this.dialogRef.close();
  }
}
