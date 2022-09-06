import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import {
   CountryISO,
   PhoneNumberFormat,
   SearchCountryField,
 } from 'ngx-intl-tel-input';
import { DecimalPipe } from '@angular/common';
import { ShortCalendarComponent } from 'src/app/shared/components/short-calendar/short-calendar.component';

@Component({
  selector: 'app-webform-client',
  templateUrl: './webform-client.component.html',
  styleUrls: ['./webform-client.component.scss'],
})
export class WebformClientComponent implements OnInit {
  inputType: 'fullName' | 'image' | 'text' | 'number' | 'phone' | 'email' | 'url' = 'url';
  clientInput = new FormGroup({
    text: new FormControl(null, [Validators.required, Validators.minLength(3)]),
    image: new FormControl(),
    phoneNumber: new FormControl(),
    name: new FormControl(null,[Validators.minLength(3)]),
    lastName: new FormControl(null, [Validators.minLength(2)]),
    email: new FormControl(),
    phone: new FormControl(null, [Validators.maxLength(15)]),
    url: new FormControl(null, [Validators.minLength(6)])
  });
  SearchCountryField = SearchCountryField;
  CountryISO = CountryISO.DominicanRepublic;
  preferredCountries: CountryISO[] = [
    CountryISO.DominicanRepublic,
    CountryISO.UnitedStates,
  ];
  PhoneNumberFormat = PhoneNumberFormat;
  image: File;
  
  constructor(private decimalPipe: DecimalPipe) {}

  ngOnInit(): void {}

  onFileInput(file: File | { image: File; index: number }) {
   if (!('index' in file)) this.image = file;
 }
}
