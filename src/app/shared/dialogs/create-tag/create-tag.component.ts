import { Component, OnInit, Inject } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

export interface DialogData {
  title: string;
}

@Component({
  selector: 'app-create-tag',
  templateUrl: './create-tag.component.html',
  styleUrls: ['./create-tag.component.scss'],
})
export class CreateTagComponent implements OnInit {
  tagForm = this._formBuilder.group({
    name: [null, Validators.required],
    images: [null, Validators.required],
  });

  constructor(
    private _formBuilder: FormBuilder,
    @Inject(MAT_DIALOG_DATA) public data: DialogData[],
    private dialogRef: MatDialogRef<CreateTagComponent>
  ) {}

  ngOnInit(): void {}

  onImageInput(files: File[]) {
    this.tagForm.get('images').patchValue(files);
    this.dialogRef.close(this.tagForm.value);
  }
}
