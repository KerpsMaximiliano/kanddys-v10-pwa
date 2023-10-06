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
import { MAT_BOTTOM_SHEET_DATA, MatBottomSheetRef } from '@angular/material/bottom-sheet';
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
    | 'email-or-phone'
    | 'password';
  validators: Array<ValidatorFn>;
  name: string;
  placeholder?: string;
  label?: string;
  secondaryIcon?: boolean;
  styles?: Record<string, string>;
  inputStyles?: Record<string, string>;
  secondaryIconCallback?: () => void;
  bottomButton?: {
    text: string;
    callback: () => any;
    containerStyles?: Record<string, string | number>;
  };
  submitButton?: {
    text?: string;
    styles?: Record<string, string>;
  };
  bottomTexts?: Array<{
    text?: string;
    styles?: Record<string, string>;
  }>;
}

export interface FormData {
  fields: Array<Field>;
  title?: {
    text: string;
    styles?: Record<string, any>;
  };
  containerStyles?: Record<string, string>;
  hideBottomButtons?: boolean;
  buttonsTexts?: {
    cancel?: string;
    accept?: string;
  };
  automaticallyFocusFirstField?: boolean;
}

@Component({
  selector: 'app-login-form',
  templateUrl: './login-form.component.html',
  styleUrls: ['./login-form.component.scss'],
})
export class LoginFormComponent implements OnInit {
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
    public bottomSheetRef: MatBottomSheetRef<LoginFormComponent>,
    @Inject(MAT_BOTTOM_SHEET_DATA) public data: FormData,
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
        case 'password':
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
        (document.querySelector(firstEditableFieldId) as HTMLElement).focus();
      }
    }, 300);
  }

  onIconClick(index: number) {
    this.data.fields[index].secondaryIconCallback();
    this.close();
  }

  close(data?: any): void {
    if (!data) this.bottomSheetRef.dismiss();
    else this.bottomSheetRef.dismiss(data);
  }

  updateFieldValue(index: number, value: any) {
    this.formGroup.get(this.data.fields[index].name).setValue(value);
  }

  updatePhoneOrEmailValue(index: number, value: any, previousValue: string) {
    this.phoneOrEmailVisible = previousValue === 'phone' ? 'email' : 'phone';

    this.updateFieldValue(index, '');
  }

  // Listen for focusin and focusout events to track keyboard visibility changes
  /*@HostListener('window:focusout', ['$event'])
  onFocusChange(event: FocusEvent) {
    const dialogElement = this.elementRef.nativeElement.parentElement;

    const clickedInsideDialog = dialogElement.contains(event.target as Node);

    const container = document.querySelector(
      '.cdk-overlay-container'
    ) as HTMLElement;
    const dialog = document.querySelector(
      '#' + this.bottomSheetRef.id
    ) as HTMLElement;

    if (
      container &&
      dialog &&
      clickedInsideDialog &&
      event.target instanceof HTMLInputElement &&
      this.viewportRuler.getViewportRect().width <= 500
    ) {
      this.keyboardVisible = false;
      const screenHeight = window.innerHeight;
      const dialogHeight = dialog.clientHeight;
      const marginTop = (screenHeight - dialogHeight) / 2;
    }
  }

  @HostListener('window:focusin', ['$event'])
  onFocusChange2(event: FocusEvent) {
    const dialogElement = this.elementRef.nativeElement.parentElement;

    const clickedInsideDialog = dialogElement.contains(event.target as Node);
    const target = event.target;

    if (
      clickedInsideDialog &&
      target instanceof HTMLInputElement &&
      !['country-search-box'].includes((target as HTMLInputElement).id) &&
      this.viewportRuler.getViewportRect().width <= 500
    ) {
      this.keyboardVisible = true;
    }
  }

  @HostListener('window:popstate', ['$event'])
  onBackButtonPress(event: PopStateEvent) {
    const container = document.querySelector(
      '.cdk-overlay-container'
    ) as HTMLElement;
    const dialog = document.querySelector(
      '#' + this.bottomSheetRef.id
    ) as HTMLElement;

    // Add your custom logic here for what should happen when the back button is pressed.
    // For example, you can navigate to a different route or show a confirmation dialog.
    if (
      container &&
      dialog &&
      this.keyboardVisible &&
      this.viewportRuler.getViewportRect().width <= 500
    ) {
      const screenHeight = window.innerHeight;
      const dialogHeight = dialog.clientHeight;
      const marginTop = (screenHeight - dialogHeight) / 2;
    }
  }

  updateDialogPosition() {
    const container = document.querySelector(
      '.cdk-overlay-container'
    ) as HTMLElement;
    const dialog = document.querySelector(
      '#' + this.bottomSheetRef.id
    ) as HTMLElement;

    const containerRect = container.getBoundingClientRect();
    const dialogRect = dialog.getBoundingClientRect();
  }*/
}
