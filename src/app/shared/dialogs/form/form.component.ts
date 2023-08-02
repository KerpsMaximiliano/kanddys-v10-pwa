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
import { CountryISO, PhoneNumberFormat } from 'ngx-intl-tel-input';

interface Field {
  type:
    | 'text'
    | 'email'
    | 'phone'
    | 'file'
    | 'number'
    | 'currency'
    | 'email-or-phone';
  validators: Array<ValidatorFn>;
  name: string;
  placeholder?: string;
  label?: string;
  secondaryIcon?: boolean;
  styles?: Record<string, string>;
  secondaryIconCallback?: () => void;
}

export interface FormData {
  fields: Array<Field>;
  title?: {
    text: string;
    styles?: Record<string, any>;
  };
  automaticallyFocusFirstField?: boolean;
}

@Component({
  selector: 'app-form',
  templateUrl: './form.component.html',
  styleUrls: ['./form.component.scss'],
})
export class FormComponent implements OnInit {
  formGroup: FormGroup;
  env: string = environment.assetsUrl;
  CountryISO = CountryISO.DominicanRepublic;
  preferredCountries: CountryISO[] = [
    CountryISO.DominicanRepublic,
    CountryISO.UnitedStates,
  ];
  PhoneNumberFormat = PhoneNumberFormat;
  keyboardVisible: boolean = false;
  phoneOrEmailVisible: 'phone' | 'email' = 'phone';

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

    if (!this.data.automaticallyFocusFirstField) {
      this.data.automaticallyFocusFirstField = true;
    }

    let firstEditableFieldFound = false;
    let alreadyFocusedFirstEditableField = false;
    let firstEditableFieldId = null;
    for (const field of this.data.fields) {
      let fieldToInsert = null;

      switch (field.type) {
        case 'email':
          fieldToInsert = new FormControl(
            '',
            field.validators.concat(Validators.email)
          );
          if (
            !firstEditableFieldFound &&
            this.data.automaticallyFocusFirstField
          )
            firstEditableFieldFound = true;
          break;
        case 'email-or-phone':
        case 'text':
        case 'currency':
        case 'phone':
        case 'number':
          if (
            !firstEditableFieldFound &&
            this.data.automaticallyFocusFirstField
          )
            firstEditableFieldFound = true;
          fieldToInsert = new FormControl('', field.validators);
          break;
      }

      if (
        firstEditableFieldFound &&
        !alreadyFocusedFirstEditableField &&
        this.data.automaticallyFocusFirstField
      ) {
        alreadyFocusedFirstEditableField = true;
        firstEditableFieldId = '#' + field.name;
      }

      this.formGroup.addControl(field.name, fieldToInsert);
    }

    setTimeout(() => {
      if (this.data.automaticallyFocusFirstField && firstEditableFieldFound) {
        console.log(document.querySelector(firstEditableFieldId) as HTMLElement);
        (document.querySelector(firstEditableFieldId) as HTMLElement).focus();
      }
    }, 300);
  }

  onIconClick(index: number) {
    this.data.fields[index].secondaryIconCallback();
    this.close();
  }

  close(): void {
    this.dialogRef.close();
  }

  updateFieldValue(index: number, value: any) {
    this.formGroup.get(this.data.fields[index].name).setValue(value);
  }

  updatePhoneOrEmailValue(index: number, value: any, previousValue: string) {
    this.phoneOrEmailVisible = previousValue === 'phone' ? 'email' : 'phone';

    this.updateFieldValue(index, '');
  }

  // Listen for focusin and focusout events to track keyboard visibility changes
  @HostListener('window:focusout', ['$event'])
  onFocusChange(event: FocusEvent) {
    const dialogElement = this.elementRef.nativeElement.parentElement;

    const clickedInsideDialog = dialogElement.contains(event.target as Node);

    if (
      clickedInsideDialog &&
      event.target instanceof HTMLInputElement &&
      this.viewportRuler.getViewportRect().width <= 500
    ) {
      this.keyboardVisible = false;
      this.dialogRef.updatePosition({ top: '50%' }); // Reset the position when the keyboard is hidden
    }
  }

  @HostListener('window:focusin', ['$event'])
  onFocusChange2(event: FocusEvent) {
    const dialogElement = this.elementRef.nativeElement.parentElement;

    const clickedInsideDialog = dialogElement.contains(event.target as Node);
    console.log('Element focused:', event.target);

    if (
      clickedInsideDialog &&
      event.target instanceof HTMLInputElement &&
      this.viewportRuler.getViewportRect().width <= 500
    ) {
      this.keyboardVisible = true;
      this.dialogRef.updatePosition({ top: '50px' }); // Reset the position when the keyboard is hidden
    }
  }

  @HostListener('window:popstate', ['$event'])
  onBackButtonPress(event: PopStateEvent) {
    // Add your custom logic here for what should happen when the back button is pressed.
    // For example, you can navigate to a different route or show a confirmation dialog.
    console.log('boton de ir hacia atras presionado');
    if (
      this.keyboardVisible &&
      this.viewportRuler.getViewportRect().width <= 500
    ) {
      this.dialogRef.updatePosition({ top: '50%' }); // Reset the position when the keyboard is hidden
    }
  }

  updateDialogPosition() {
    const container = document.querySelector(
      '.cdk-overlay-container'
    ) as HTMLElement;
    const dialog = document.querySelector(
      '#' + this.dialogRef.id
    ) as HTMLElement;

    const containerRect = container.getBoundingClientRect();
    const dialogRect = dialog.getBoundingClientRect();

    console.log(containerRect, dialogRect);

    this.dialogRef.updatePosition({
      top:
        (containerRect.height - dialogRect.height) / 2 +
        containerRect.top +
        'px',
    });
  }
}
