import {
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
  Type,
} from '@angular/core';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  ValidatorFn,
} from '@angular/forms';
import { Subscription } from 'rxjs';
import { DialogFlowService } from 'src/app/core/services/dialog-flow.service';
import {
  SearchCountryField,
  CountryISO,
  PhoneNumberFormat,
} from 'ngx-intl-tel-input';
import { DomSanitizer, SafeStyle } from '@angular/platform-browser';

enum FormType {
  text = 'text',
  checkbox = 'checkbox',
  area = 'area',
  selection = 'selection',
  phone = 'phone',
}

export interface DialogField {
  type: FormType;
  stylesGrid: Record<string, string>;
  placeholder: string;
  styles: Record<string, string>;
  name: string;
  label: {
    styles: Record<string, string>;
    text: string;
  };
  disclaimer: {
    styles: Record<string, string>;
    text: string;
  };
  component?: Type<any>,
  shouldRerender: boolean,
  inputs: any[],
  outputs: any[],
  selection: {
    selection: {
      ['prop']: string;
    };
    styles: Record<string, string>;
    list: Array<{
      text: string;
      barStyle: Record<string, string>;
      subText: {
        text: string;
        text2?: string;
        styles: Record<string, string>;
      };
      styles: Record<string, string>;
    }>;
  };
  prop: string;
  value: any;
  validators: ValidatorFn[];
};

@Component({
  selector: 'app-general-dialog',
  templateUrl: './general-dialog.component.html',
  styleUrls: ['./general-dialog.component.scss'],
})
export class GeneralDialogComponent implements OnInit, OnDestroy {
  @Input('containerStyles') containerStyles: Record<string, string>;
  @Input('dialogId') dialogId: string;
  @Input('header') header: {
    styles?: Record<string, string>;
    text?: string;
  } = {};
  @Input('title') title: {
    styles?: Record<string, string>;
    text?: string;
  } = {};
  @Input('fields') fields: {
    styles?: Record<string, string>;
    list?: Array<DialogField>;
  } = {};
  @Input('isMultiple') isMultiple: boolean = false;
  @Input('isMultipleImages') isMultipleImages: boolean = false;
  @Output('data') data: EventEmitter<any> = new EventEmitter();
  @Input('omitTabFocus') omitTabFocus: boolean = true;
  selected: string[] = [];
  selectedImage: string [] = [];
  controller: FormGroup;
  sub: Subscription;
  PhoneNumberFormat = PhoneNumberFormat;
  CountryISO = CountryISO.DominicanRepublic;
  preferredCountries: CountryISO[] = [
    CountryISO.DominicanRepublic,
    CountryISO.UnitedStates,
  ];

  constructor(
    private dialogFlowService: DialogFlowService,
    private _DomSanitizer: DomSanitizer
  ) {}

  ngOnInit(): void {
    this.initControllers();
    setTimeout(() => {
      if (this.dialogFlowService.activeDialogId === this.dialogId) {
        this.dialogFlowService.swiperConfig.allowSlideNext =
          this.controller.valid;
      }
    }, 500);
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }

  setSelected(item, controller: AbstractControl): void {
    if (this.selected.includes(item)) {
      this.selected = this.selected.filter((tg) => tg !== item);
      controller.setValue(this.selected);
    } else {
      const value = this.isMultiple ? [...this.selected, item] : [item];
      this.selected = value;
      controller.setValue(this.selected);
    }
  }

  setSelectedImage(item, controller: AbstractControl): void {
    if (this.selectedImage.includes(item)) {
      this.selectedImage = this.selectedImage.filter((tg) => tg !== item);
      controller.setValue(this.selectedImage);
    } else {
      const value = this.isMultipleImages ? [...this.selectedImage, item] : [item];
      this.selectedImage = value;
      controller.setValue(this.selectedImage);
    }
  }

  initControllers(): void {
    this.controller = new FormGroup({});
    for (const { name, value, validators } of this.fields.list) {
      this.controller.addControl(name, new FormControl(value, validators));
    }
    this.sub = this.controller.valueChanges.subscribe((value) => {

      if (this.dialogFlowService.activeDialogId === this.dialogId) {
        if (this.controller.valid) {
          this.dialogFlowService.swiperConfig.allowSlideNext = true;
        } else {
          this.dialogFlowService.swiperConfig.allowSlideNext = false;
        }
      }


      this.data.emit({
        value,
        fields: this.fields.list,
        valid: this.controller.valid,
      });
    });
  }

  checkboxChange({ target }, control: AbstractControl): void {
    control.setValue(target.checked);
  }

  sanitize(src: any):SafeStyle {
    const result: SafeStyle = this._DomSanitizer.bypassSecurityTrustStyle(`url(
      ${src})
      no-repeat center center / cover #2e2e2e`);
    return result;
  }
}
