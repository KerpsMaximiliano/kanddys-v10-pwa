import { Component, OnInit, Input } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';

// export interface MatStepperTemplate {
//   label: string;
//   form: FormGroup;
// }

@Component({
  selector: 'app-stepper-form',
  templateUrl: './stepper-form.component.html',
  styleUrls: ['./stepper-form.component.scss'],
})
export class StepperFormComponent implements OnInit {
  itemForm = this._formBuilder.group({
    pricing: [null, Validators.required],
    images: [null, Validators.required],
  });
  isLinear = false;
  // matStep: MatStepperTemplate[] = [];

  constructor(
    private _formBuilder: FormBuilder,
    private dialogRef: MatDialogRef<StepperFormComponent>
  ) {}

  async ngOnInit() {}

  onCurrencyInput(value: number) {
    this.itemForm.get('pricing').patchValue(value);
  }

  onImageInput(files: File[]) {
    this.itemForm.get('images').patchValue(files);
    this.dialogRef.close(this.itemForm.value);
  }
}
