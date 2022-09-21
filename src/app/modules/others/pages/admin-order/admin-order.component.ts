import { Component, OnInit } from '@angular/core';
import { DialogService } from 'src/app/libs/dialog/services/dialog.service';
import { ImageViewComponent } from 'src/app/shared/dialogs/image-view/image-view.component';
import { OrderService } from 'src/app/core/services/order.service';
import { ItemOrderInput } from 'src/app/core/models/order';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import {
  CountryISO,
  PhoneNumberFormat,
  SearchCountryField,
} from 'ngx-intl-tel-input';

@Component({
  selector: 'app-admin-order',
  templateUrl: './admin-order.component.html',
  styleUrls: ['./admin-order.component.scss'],
})
export class AdminOrderComponent implements OnInit {
  SearchCountryField = SearchCountryField;
  CountryISO = CountryISO.DominicanRepublic;
  preferredCountries: CountryISO[] = [
    CountryISO.DominicanRepublic,
    CountryISO.UnitedStates,
  ];
  PhoneNumberFormat = PhoneNumberFormat;
  payment: number;
  items: any[];
  registerForm = new FormGroup({
    firstName: new FormControl('',[
      Validators.required,
      Validators.minLength(2),
      Validators.pattern(/^[a-z\s\u00E0-\u00FC\u00f1\u00d1]*$/i),
    ]),
    lastName: new FormControl('',[
      Validators.required,
      Validators.minLength(2),
      Validators.pattern(/^[a-z\s\u00E0-\u00FC\u00f1\u00d1]*$/i),
    ]),
    phoneNumber: new FormControl('',[Validators.required]),
    email: new FormControl('',[Validators.required, Validators.email]),
    password: new FormControl('',[Validators.required, Validators.minLength(3)]),
  });
  order: ItemOrderInput;
  date: {
    month: string;
    day: number;
    weekday: string;
    time: string;
  };

  constructor(
    private dialogService: DialogService,
    private orderService: OrderService
  ) {}

  ngOnInit(): void {}

  openImageModal(imageSourceURL: string) {
    this.dialogService.open(ImageViewComponent, {
      type: 'fullscreen-translucent',
      props: {
        imageSourceURL,
      },
      customClass: 'app-dialog',
      flags: ['no-header'],
    });
  }

  mouseDown: boolean;
  startX: number;
  scrollLeft: number;

  startDragging(e: MouseEvent, el: HTMLDivElement) {
    this.mouseDown = true;
    this.startX = e.pageX - el.offsetLeft;
    this.scrollLeft = el.scrollLeft;
  }

  stopDragging() {
    this.mouseDown = false;
  }

  moveEvent(e: MouseEvent, el: HTMLDivElement) {
    e.preventDefault();
    if (!this.mouseDown) {
      return;
    }
    const x = e.pageX - el.offsetLeft;
    const scroll = x - this.startX;
    el.scrollLeft = this.scrollLeft - scroll;
  }
}
