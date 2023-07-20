import {
  Component,
  OnInit,
  Inject,
  HostListener,
  ElementRef,
} from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { ViewportRuler } from '@angular/cdk/overlay';
import { environment } from 'src/environments/environment';

interface Field {
  type: 'text' | 'email' | 'phone' | 'file' | 'number';
  validators: Array<ValidatorFn>;
  name: string;
  placeholder?: string;
  label: string;
  secondaryIcon?: boolean;
  styles?: Record<string, string>;
  secondaryIconCallback?: () => void;
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
  env: string = environment.assetsUrl;

  constructor(
    public dialogRef: MatDialogRef<FormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: FormData,
    private fb: FormBuilder,
    private viewportRuler: ViewportRuler,
    private elementRef: ElementRef,
    private translate: TranslateService
  ) {
    translate.setDefaultLang('en');
    translate.use('en');
  }

  ngOnInit(): void {
    this.formGroup = this.fb.group({});
    for (const field of this.data.fields) {
      let fieldToInsert = null;

      switch (field.type) {
        case 'text':
          fieldToInsert = new FormControl('', field.validators);
          break;
        case 'number':
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

  onIconClick(index: number) {
    this.data.fields[index].secondaryIconCallback();
    this.close();
  }

  close(): void {
    this.dialogRef.close();
  }


  // Listen for focusin and focusout events to track keyboard visibility changes
  @HostListener('window:focusout', ['$event'])
  onFocusChange(event: FocusEvent) {
    const dialogElement = this.elementRef.nativeElement.parentElement;

    const clickedInsideDialog = dialogElement.contains(event.target as Node);

    if (clickedInsideDialog && event.target instanceof HTMLInputElement && this.viewportRuler.getViewportRect().width <= 500) {
      this.dialogRef.updatePosition({ top: '50%' }); // Reset the position when the keyboard is hidden
    }
  }

  @HostListener('window:focusin', ['$event'])
  onFocusChange2(event: FocusEvent) {
    const dialogElement = this.elementRef.nativeElement.parentElement;


    const clickedInsideDialog = dialogElement.contains(event.target as Node);

    if (clickedInsideDialog && event.target instanceof HTMLInputElement && this.viewportRuler.getViewportRect().width <= 500) {
      this.dialogRef.updatePosition({ top: '50px' }); // Reset the position when the keyboard is hidden
    }
  }
}