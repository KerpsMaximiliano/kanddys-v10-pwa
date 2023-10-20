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
import { MerchantsService } from 'src/app/core/services/merchants.service';
import { AuthService } from 'src/app/core/services/auth.service';
import { MatBottomSheet, MatBottomSheetRef } from '@angular/material/bottom-sheet';
import { ContactUsDialogComponent } from '../contact-us-dialog/contact-us-dialog.component';

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
    disabledStyles?: Record<string, string>;
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
  buttonsStyles?: Record<string, string | number>
  closeCallback?: () => void;
  signInValidation?: 'user' | 'commerce'
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
    private translate: TranslateService,
    private merchantsService: MerchantsService,
    private bottomSheet: MatBottomSheet,
    private authService: AuthService
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

  async submit() {
    const censorWord = (str: string) => {
      console.log(str)
      return str[0] + '*'.repeat(str.length - 2) + str[str.length - 1];
    }
    const censorEmail = (str: string) => {
      const [name, domain] = str.split('@')
      return censorWord(name) + '@' + censorWord(domain)
    }
    if (this.formGroup.valid) {
      if(this.data.signInValidation && this.data.signInValidation === 'commerce') {
        let nameFree = true
        let phoneFree = true
        if(this.formGroup.value.businessName) {
          nameFree = false
          let nameTaken = await this.merchantsService.merchantByName(this.formGroup.value.businessName)
          console.log(nameTaken)
          if(nameTaken) {
            let string = nameTaken.email ? censorEmail(nameTaken.email) : censorEmail(nameTaken.owner.email)
            this.bottomSheet.open(ContactUsDialogComponent, {
              data: {
                topText: `Este nombre ya se encuentra registrado con otro usuario (${string})`,
                contactText: 'Escribenos por Whatsapp para reclamarlo 👇',
                phone: '19188156444',
                message: `Hola, quisiera reclamar el nombre comercial ${this.formGroup.value.businessName}`,
              }
            })
          } else {
            nameFree = true
          }
        }
        if(this.formGroup.value.phone) {
          phoneFree = false
          let phoneTaken = await this.authService.checkUser(this.formGroup.value.phone.e164Number)
          console.log(phoneTaken)
          if(phoneTaken) {
            let string = phoneTaken.email ? censorEmail(phoneTaken.email) : 'email no existe'
            this.bottomSheet.open(ContactUsDialogComponent, {
              data: {
                topText: `Este teléfono ya se encuentra registrado con otro usuario (${string})`,
                contactText: 'Escribenos por Whatsapp para reclamarlo 👇',
                phone: '19188156444',
                message: `Hola, quisiera reclamar el teléfono ${this.formGroup.value.phone.e164Number}`,
              }
            })
          } else {
            phoneFree = true
          }
        }
        if(nameFree && phoneFree) this.close(this.formGroup);
      } else if(this.data.signInValidation && this.data.signInValidation === 'user') {
        if(this.formGroup.value.phone) {
          let phoneTaken = await this.authService.checkUser(this.formGroup.value.phone.e164Number)
          if(phoneTaken) {
            let string = phoneTaken.email ? censorEmail(phoneTaken.email) : 'email no existe'
            this.bottomSheet.open(ContactUsDialogComponent, {
              data: {
                topText: `Este teléfono ya se encuentra registrado con otro usuario (${string})`,
                contactText: 'Escribenos por Whatsapp para reclamarlo 👇',
                phone: '19188156444',
                message: `Hola, quisiera reclamar el teléfono ${this.formGroup.value.phone.e164Number}`,
              }
            })
          } else {
            this.close(this.formGroup)
          }
        }
      } else {
        this.close(this.formGroup);
      }
    }
  }

  close(data?: any): void {
    if (!data) this.dialogRef.close();
    else this.dialogRef.close(data);
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

    const container = document.querySelector(
      '.cdk-overlay-container'
    ) as HTMLElement;
    const dialog = document.querySelector(
      '#' + this.dialogRef.id
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

      this.dialogRef.updatePosition({ top: marginTop + 'px' });
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
      this.dialogRef.updatePosition({ top: '50px' }); // Reset the position when the keyboard is hidden
    }
  }

  @HostListener('window:popstate', ['$event'])
  onBackButtonPress(event: PopStateEvent) {
    const container = document.querySelector(
      '.cdk-overlay-container'
    ) as HTMLElement;
    const dialog = document.querySelector(
      '#' + this.dialogRef.id
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

      this.dialogRef.updatePosition({ top: marginTop + 'px' }); // Reset the position when the keyboard is hidden
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

    this.dialogRef.updatePosition({
      top:
        (containerRect.height - dialogRect.height) / 2 +
        containerRect.top +
        'px',
    });
  }
}
