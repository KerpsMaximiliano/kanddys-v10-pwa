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

export interface DialogData {
  styles?: {
    dialogContainer?: Record<string, any>;
    title?: Record<string, any>;
    buttonsContainer?: Record<string, any>;
    button?: Record<string, any>;
  },
  title?: {
    text: string;
  };
  texts?: {
    cancel?: string;
    accept?: string;
  };
}

@Component({
  selector: 'app-confirmation-simple',
  templateUrl: './confirmation-simple.component.html',
  styleUrls: ['./confirmation-simple.component.scss'],
})
export class ConfirmationSimpleComponent implements OnInit {
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
    public dialogRef: MatDialogRef<ConfirmationSimpleComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
    private fb: FormBuilder,
    private viewportRuler: ViewportRuler,
    private elementRef: ElementRef
  ) {}

  ngOnInit(): void {
  }
  
  close(): void {
    this.dialogRef.close();
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
